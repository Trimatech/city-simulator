/**
 * Main simulation engine — runs the Micropolis 16-phase simulation cycle.
 *
 * Each tick advances one phase. The 16 phases are:
 *   0: Increment counters, recalculate valves, clear census
 *   1-8: Map scan (zone evaluation) in 8 strips
 *   9: Census snapshots (10-year, 120-year), tax collection
 *   10: Neutralise rate-of-growth and traffic maps
 *   11: Power grid scan
 *   12: Pollution/terrain/land value scan
 *   13: Crime scan
 *   14: Population density scan
 *   15: Fire analysis
 */

import { MAP_HEIGHT, MAP_WIDTH, SIM_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { clearCensus, take10Census, take120Census } from "shared/simulation/census";
import { doPowerScan } from "shared/simulation/power-grid";
import { setValves } from "shared/simulation/valves";
import {
	evaluateResidential,
	evaluateCommercial,
	evaluateIndustrial,
} from "shared/simulation/zone-eval";
import {
	pollutionTerrainLandValueScan,
	crimeScan,
	populationDensityScan,
	fireAnalysis,
	neutraliseRateOfGrowthMap,
	neutraliseTrafficMap,
} from "shared/simulation/block-map-utils";
import {
	LOMASK,
	ZONEBIT,
	isResidentialZone,
	isCommercialZone,
	isIndustrialZone,
	FIRESTATION,
	POLICESTATION,
	POWERPLANT,
	NUCLEAR,
	STADIUM,
	AIRPORT,
	PORT,
	COALBASE,
	LASTPOWERPLANT,
	NUCLEARBASE,
	tileType,
	ROADBASE,
	LASTROAD,
	RAILBASE,
	LASTRAIL,
} from "shared/simulation/tile-values";
import { createScheduler } from "shared/utils/scheduler";
import { Players } from "@rbxts/services";
import { store } from "server/store";

import { getAllCities, initCityManager } from "./city-manager";
import type { SimContext } from "./sim-context";

// Initialize the city manager (handles player join/leave, tool placement)
initCityManager();

// ── Speed-dependent frequency tables ──────────────────────────────────
// Indexed by (speed - 1): 0=slow, 1=medium, 2=fast
const speedPowerScan = [2, 4, 5];
const speedPollutionScan = [2, 7, 17];
const speedCrimeScan = [1, 8, 18];
const speedPopDensityScan = [1, 9, 19];
const speedFireAnalysis = [1, 10, 20];

const CENSUS_FREQUENCY_10 = 4;
const CENSUS_FREQUENCY_120 = CENSUS_FREQUENCY_10 * 10;
const TAX_FREQUENCY = 48;

// ── Map scan (phases 1-8) ─────────────────────────────────────────────

/**
 * Scan a horizontal strip of the map, evaluating zone centers.
 * Strip index 0-7 covers the full map width in 8 equal parts.
 */
function mapScanStrip(ctx: SimContext, stripIndex: number): void {
	const stripWidth = math.floor(MAP_WIDTH / 8);
	const startX = stripIndex * stripWidth;
	const endX = stripIndex === 7 ? MAP_WIDTH : (stripIndex + 1) * stripWidth;

	const tileMap = ctx.tileMap;
	const census = ctx.census;
	const blockMaps = ctx.blockMaps;

	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = startX; x < endX; x++) {
			const rawTile = tileMap.get(x, y);

			// Only process zone centers
			if ((rawTile & ZONEBIT) === 0) continue;

			const tBase = rawTile & LOMASK;

			// Count special buildings and infrastructure
			if (tBase === FIRESTATION) {
				census.fireStationPop += 1;
				blockMaps.fireStationMap.worldSet(x, y, blockMaps.fireStationMap.worldGet(x, y) + 100);
			} else if (tBase === POLICESTATION) {
				census.policeStationPop += 1;
				blockMaps.policeStationMap.worldSet(x, y, blockMaps.policeStationMap.worldGet(x, y) + 100);
			} else if (tBase === POWERPLANT) {
				census.coalPowerPop += 1;
			} else if (tBase === NUCLEAR) {
				census.nuclearPowerPop += 1;
			} else if (tBase === STADIUM) {
				census.stadiumPop += 1;
			} else if (tBase === AIRPORT) {
				census.airportPop += 1;
			} else if (tBase === PORT) {
				census.seaportPop += 1;
			}

			// Evaluate zone growth/decline
			if (isResidentialZone(rawTile)) {
				evaluateResidential(tileMap, x, y, census, blockMaps, ctx.valves.resValve);
			} else if (isCommercialZone(rawTile)) {
				evaluateCommercial(tileMap, x, y, census, blockMaps, ctx.valves.comValve);
			} else if (isIndustrialZone(rawTile)) {
				evaluateIndustrial(tileMap, x, y, census, blockMaps, ctx.valves.indValve);
			}
		}
	}

	// Count roads and rails during the first strip scan
	if (stripIndex === 0) {
		census.roadTotal = 0;
		census.railTotal = 0;
		for (let y2 = 0; y2 < MAP_HEIGHT; y2++) {
			for (let x2 = 0; x2 < MAP_WIDTH; x2++) {
				const t = tileType(tileMap.get(x2, y2));
				if (t >= ROADBASE && t <= LASTROAD) census.roadTotal++;
				else if (t >= RAILBASE && t <= LASTRAIL) census.railTotal++;
			}
		}
	}
}

// ── Compute total population and city class ───────────────────────────

function computeTotalPopulation(ctx: SimContext): number {
	const c = ctx.census;
	// Micropolis formula: res/8 + com + ind (res is counted at higher granularity)
	return math.floor(c.resPop / 8) + c.comPop + c.indPop;
}

function getCityClass(pop: number): CityClass {
	if (pop < 2000) return "Village";
	if (pop < 10000) return "Town";
	if (pop < 50000) return "City";
	if (pop < 100000) return "Capital";
	if (pop < 500000) return "Metropolis";
	return "Megalopolis";
}

// ── Simulate one phase ────────────────────────────────────────────────

function simulatePhase(ctx: SimContext): void {
	ctx.phaseCycle &= 15;
	const speedIndex = math.clamp(ctx.speed - 1, 0, 2);

	switch (ctx.phaseCycle) {
		case 0: {
			// Advance cycle counter
			ctx.simCycle++;
			if (ctx.simCycle > 1023) ctx.simCycle = 0;

			ctx.cityTime++;

			// Recalculate valves every other cycle
			if ((ctx.simCycle & 1) === 0) {
				const taxRate = store.getState().budget.taxRate;
				setValves(ctx.valves, 0, ctx.census, taxRate);
			}

			// Clear per-scan census counters
			clearCensus(ctx.census);

			// Clear service maps before accumulating during scan
			ctx.blockMaps.fireStationMap.clear();
			ctx.blockMaps.policeStationMap.clear();
			break;
		}

		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8: {
			// Map scan: process one of 8 vertical strips
			mapScanStrip(ctx, ctx.phaseCycle - 1);
			break;
		}

		case 9: {
			// Census snapshots
			if (ctx.cityTime % CENSUS_FREQUENCY_10 === 0) {
				const cashFlow =
					store.getState().budget.totalIncome - store.getState().budget.totalExpenses;
				take10Census(ctx.census, cashFlow);
			}

			if (ctx.cityTime % CENSUS_FREQUENCY_120 === 0) {
				take120Census(ctx.census);
			}

			// Tax collection at year boundaries
			if (ctx.cityTime % TAX_FREQUENCY === 0) {
				// Simple tax collection: income based on population and tax rate
				const budgetState = store.getState().budget;
				const totalPop = computeTotalPopulation(ctx);
				const income = math.floor(totalPop * budgetState.taxRate / 100);

				// Service expenses based on building counts and funding levels
				const roadExpense = math.floor(ctx.census.roadTotal * budgetState.roadFunding / 100);
				const policeExpense = math.floor(
					ctx.census.policeStationPop * 100 * budgetState.policeFunding / 100,
				);
				const fireExpense = math.floor(
					ctx.census.fireStationPop * 100 * budgetState.fireFunding / 100,
				);
				const totalExpenses = roadExpense + policeExpense + fireExpense;

				store.setBudgetTotals(income, totalExpenses);
				store.addFunds(income - totalExpenses);

				// Advance date
				store.advanceDate();
			}

			// Compute total population and update store
			const totalPop = computeTotalPopulation(ctx);
			ctx.census.totalPop = totalPop;
			store.setPopulation(totalPop);
			store.setDemand(ctx.valves.resValve, ctx.valves.comValve, ctx.valves.indValve);
			store.setCityClass(getCityClass(totalPop));
			store.setCrimeRate(ctx.census.crimeAverage);
			store.setPollutionRate(ctx.census.pollutionAverage);
			store.setLandValueAvg(ctx.census.landValueAverage);
			break;
		}

		case 10: {
			// Neutralise growth and traffic maps
			if (ctx.simCycle % 5 === 0) {
				neutraliseRateOfGrowthMap(ctx.blockMaps);
			}
			neutraliseTrafficMap(ctx.blockMaps);
			break;
		}

		case 11: {
			// Power grid scan
			if (ctx.simCycle % speedPowerScan[speedIndex] === 0 || ctx.powerGridDirty) {
				doPowerScan(ctx.tileMap, ctx.census);
				ctx.powerGridDirty = false;
			}
			break;
		}

		case 12: {
			// Pollution, terrain, and land value scan
			if (ctx.simCycle % speedPollutionScan[speedIndex] === 0) {
				pollutionTerrainLandValueScan(ctx.tileMap, ctx.census, ctx.blockMaps);
			}
			break;
		}

		case 13: {
			// Crime scan
			if (ctx.simCycle % speedCrimeScan[speedIndex] === 0) {
				crimeScan(ctx.census, ctx.blockMaps);
			}
			break;
		}

		case 14: {
			// Population density scan
			if (ctx.simCycle % speedPopDensityScan[speedIndex] === 0) {
				populationDensityScan(ctx.tileMap, ctx.blockMaps);
			}
			break;
		}

		case 15: {
			// Fire station coverage analysis
			if (ctx.simCycle % speedFireAnalysis[speedIndex] === 0) {
				fireAnalysis(ctx.blockMaps);
			}
			// TODO Phase 8: disasters
			break;
		}
	}

	// Advance to next phase
	ctx.phaseCycle = (ctx.phaseCycle + 1) & 15;
}

// ── Simulation tick loop ────────────────────────────────────────────

createScheduler({
	name: "SimEngine",
	tick: SIM_TICK,
	onTick: () => {
		const cities = getAllCities();

		cities.forEach((ctx, userId) => {
			if (ctx.speed === 0) return; // paused

			const player = Players.GetPlayerByUserId(userId);
			if (!player) return;

			// Run multiple phases per tick based on speed
			// Speed 1 = 1 phase/tick, 2 = 2, 3 = 3
			for (let i = 0; i < ctx.speed; i++) {
				simulatePhase(ctx);
			}

			// Flush dirty tiles and send deltas to client
			if (ctx.tileMap.isDirty()) {
				const deltas = ctx.tileMap.flushDirty();
				remotes.city.applyDeltas.fire(player, deltas);
			}
		});
	},
});

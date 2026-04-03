/**
 * RCI demand valve calculation — port of micropolisJS valves.js for roblox-ts.
 *
 * The valves control global demand for residential, commercial, and industrial
 * zones. Positive valve = demand for growth, negative = pressure to decline.
 * These are the "RCI bars" shown in the classic SimCity demand indicator.
 */

import { type CensusData } from "./census";

// ── Valve state ────────────────────────────────────────────────────────

export interface ValveState {
	resValve: number; // -2000 to 2000
	comValve: number; // -1500 to 1500
	indValve: number; // -1500 to 1500
	resCap: boolean;
	comCap: boolean;
	indCap: boolean;
}

export function createValves(): ValveState {
	return {
		resValve: 0,
		comValve: 0,
		indValve: 0,
		resCap: false,
		comCap: false,
		indCap: false,
	};
}

// ── Tax table (from Micropolis) ────────────────────────────────────────
// Indexed by tax rate (0-20), gives the tax effect multiplier.
// Higher tax rates produce larger negative effects on growth.
const taxTable: readonly number[] = [
	200, 150, 120, 100, 80, 50, 30, 0, -10, -40, -100, -150, -200, -250, -300, -350, -400, -450, -500, -550, -600,
];

// ── External market parameter table ────────────────────────────────────
// Indexed by game difficulty (0 = easy, 1 = medium, 2 = hard).
// Controls external demand pressure.
const extMarketParamTable: readonly number[] = [1.2, 1.0, 0.98];

// ── setValves ──────────────────────────────────────────────────────────

/**
 * Recalculate the RCI demand valves based on current census data,
 * tax rate, and game difficulty level.
 *
 * Port of the exact algorithm from micropolisJS valves.js.
 *
 * @param valves - Valve state to update in place
 * @param gameLevel - Difficulty: 0 = easy, 1 = medium, 2 = hard
 * @param census - Current census data (after a full map scan)
 * @param taxRate - Current tax rate (0-20)
 */
export function setValves(valves: ValveState, gameLevel: number, census: CensusData, taxRate: number): void {
	// Clamp inputs
	const level = math.clamp(gameLevel, 0, 2);
	const tax = math.clamp(math.floor(taxRate), 0, 20);

	// Normalize populations (Micropolis uses 8 as the residential divisor)
	const normResPop = census.resPop / 8;
	const totalPop = normResPop + census.comPop + census.indPop;

	// If city is empty, set small positive demand and return
	if (totalPop === 0) {
		valves.resValve = 350;
		valves.comValve = 350;
		valves.indValve = 350;
		return;
	}

	// Ratio of each sector
	const resRatio = normResPop / totalPop;
	const comRatio = census.comPop / totalPop;
	const indRatio = census.indPop / totalPop;

	// Employment: how many workers industry and commerce can absorb
	const employment = (census.comPop + census.indPop) * 8;

	// Migration: based on how many workers are needed vs available
	let migration: number;
	if (normResPop > 0) {
		migration = normResPop - employment;
		migration = math.floor(migration / 16);
	} else {
		migration = 100;
	}

	// Births: proportional to residential population
	const births = math.floor(normResPop * 0.02);

	// Labour base: workers available
	const labourBase = normResPop + migration + births;

	// External market parameter based on difficulty
	const extMarket = extMarketParamTable[level];

	// Internal market: based on population that generates commerce demand
	const internalMarket = math.floor((normResPop + census.comPop + census.indPop) / 3);

	// Projected industrial population: what industry wants
	const projectedIndPop = census.indPop * labourBase / (labourBase > 0 ? labourBase : 1);

	// Projected commercial population: what commerce wants
	const projectedComPop = internalMarket * extMarket;

	// ── Residential valve ──────────────────────────────────────────────

	// Residential demand based on employment ratio
	let resValveTemp: number;
	if (normResPop > 0) {
		const employmentRatio = employment / normResPop;
		// Clamp employment ratio effect
		const clampedRatio = math.clamp(employmentRatio, 0, 2);
		resValveTemp = math.floor((clampedRatio - 1) * 600);
	} else {
		resValveTemp = 500; // Strong initial demand
	}

	// Apply births pressure
	resValveTemp += births;

	// Apply tax effect
	resValveTemp += taxTable[tax];

	// ── Commercial valve ───────────────────────────────────────────────

	let comValveTemp: number;
	if (census.comPop > 0) {
		const comRatioCalc = projectedComPop / census.comPop;
		const clampedComRatio = math.clamp(comRatioCalc, 0, 2);
		comValveTemp = math.floor((clampedComRatio - 1) * 600);
	} else {
		comValveTemp = 500;
	}

	comValveTemp += taxTable[tax];

	// ── Industrial valve ───────────────────────────────────────────────

	let indValveTemp: number;
	if (census.indPop > 0) {
		const indRatioCalc = labourBase / (census.indPop > 0 ? census.indPop : 1);
		const clampedIndRatio = math.clamp(indRatioCalc, 0, 2);
		indValveTemp = math.floor((clampedIndRatio - 1) * 600);
	} else {
		indValveTemp = 500;
	}

	indValveTemp += taxTable[tax];

	// ── Apply external market ──────────────────────────────────────────

	comValveTemp = math.floor(comValveTemp * extMarket);
	indValveTemp = math.floor(indValveTemp * extMarket);

	// ── Clamp valves to their ranges ───────────────────────────────────

	resValveTemp = math.clamp(resValveTemp, -2000, 2000);
	comValveTemp = math.clamp(comValveTemp, -1500, 1500);
	indValveTemp = math.clamp(indValveTemp, -1500, 1500);

	// ── Apply caps ─────────────────────────────────────────────────────
	// If a sector has hit its cap, prevent further positive demand

	if (valves.resCap && resValveTemp > 0) {
		resValveTemp = 0;
	}
	if (valves.comCap && comValveTemp > 0) {
		comValveTemp = 0;
	}
	if (valves.indCap && indValveTemp > 0) {
		indValveTemp = 0;
	}

	// ── Store results ──────────────────────────────────────────────────

	valves.resValve = resValveTemp;
	valves.comValve = comValveTemp;
	valves.indValve = indValveTemp;
}

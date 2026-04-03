/**
 * Zone evaluation — residential, commercial, and industrial zone growth/decline.
 * Simplified port of micropolisJS zone evaluation for roblox-ts.
 *
 * During map scan, when a zone center tile is found, the appropriate
 * evaluate function is called. It checks power, counts population,
 * scores desirability, then grows or degrades the zone.
 */

import { BlockMap } from "./block-map";
import { type CensusData } from "./census";
import { TileMap } from "./tile-map";
import {
	COMCLR,
	CZB,
	FREEZ,
	INDCLR,
	IZB,
	LOMASK,
	POWERBIT,
	RZB,
	BULLBIT,
	BURNBIT,
	CONDBIT,
	ZONEBIT,
	tileType,
} from "./tile-values";

// ── BlockMaps interface ────────────────────────────────────────────────

export interface BlockMaps {
	landValueMap: BlockMap;
	pollutionDensityMap: BlockMap;
	crimeRateMap: BlockMap;
	populationDensityMap: BlockMap;
	trafficDensityMap: BlockMap;
	rateOfGrowthMap: BlockMap;
	fireStationMap: BlockMap;
	fireStationEffectMap: BlockMap;
	policeStationMap: BlockMap;
	policeStationEffectMap: BlockMap;
	cityCentreDistScoreMap: BlockMap;
	terrainDensityMap: BlockMap;
}

// ── Constants ──────────────────────────────────────────────────────────

// Residential zone density levels (3x3 zone, 4 developed levels)
// FREEZ = empty zone (pop 0)
// RZB        = first developed (pop ~16)
// RZB + 9    = second level    (pop ~24)
// RZB + 18   = third level     (pop ~32)
// RZB + 27   = fourth level    (pop ~40)
const RES_DENSITY_STEPS = 4;
const RES_STEP_SIZE = 9; // tiles per density step in the tile table
const RES_POP_TABLE = [16, 24, 32, 40];

// Commercial zone density levels
const COM_DENSITY_STEPS = 4;
const COM_STEP_SIZE = 9;
const COM_POP_TABLE = [10, 20, 30, 40];

// Industrial zone density levels
const IND_DENSITY_STEPS = 4;
const IND_STEP_SIZE = 9;
const IND_POP_TABLE = [10, 20, 30, 40];

// ── Helpers ────────────────────────────────────────────────────────────

/** Get residential zone population from the center tile value. */
function getResZonePop(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === FREEZ) return 0;
	const level = math.floor((t - RZB) / RES_STEP_SIZE);
	if (level < 0 || level >= RES_DENSITY_STEPS) return 0;
	return RES_POP_TABLE[level];
}

/** Get commercial zone population from the center tile value. */
function getComZonePop(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === COMCLR) return 0;
	const level = math.floor((t - CZB) / COM_STEP_SIZE);
	if (level < 0 || level >= COM_DENSITY_STEPS) return 0;
	return COM_POP_TABLE[level];
}

/** Get industrial zone population from the center tile value. */
function getIndZonePop(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === INDCLR) return 0;
	const level = math.floor((t - IZB) / IND_STEP_SIZE);
	if (level < 0 || level >= IND_DENSITY_STEPS) return 0;
	return IND_POP_TABLE[level];
}

/** Get current density level (0 = empty, 1-4 = developed). */
function getResLevel(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === FREEZ) return 0;
	return math.floor((t - RZB) / RES_STEP_SIZE) + 1;
}

function getComLevel(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === COMCLR) return 0;
	return math.floor((t - CZB) / COM_STEP_SIZE) + 1;
}

function getIndLevel(centerTile: number): number {
	const t = tileType(centerTile);
	if (t === INDCLR) return 0;
	return math.floor((t - IZB) / IND_STEP_SIZE) + 1;
}

/**
 * Place a 3x3 zone centered on (cx, cy) using a base tile value.
 * The 9 tiles are base+0 through base+8, laid out left-to-right, top-to-bottom.
 * The center tile (offset 4) gets ZONEBIT | BULLBIT | BURNBIT | CONDBIT flags.
 * Other tiles get BULLBIT | BURNBIT | CONDBIT.
 */
function placeZone3x3(tileMap: TileMap, cx: number, cy: number, baseTile: number, powered: boolean): void {
	const powerFlag = powered ? POWERBIT : 0;
	let tileIdx = 0;
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			let flags = BULLBIT | BURNBIT | CONDBIT;
			if (dx === 0 && dy === 0) {
				flags = flags | ZONEBIT;
			}
			tileMap.set(cx + dx, cy + dy, (baseTile + tileIdx) | flags | powerFlag);
			tileIdx++;
		}
	}
}

// ── Evaluation functions ───────────────────────────────────────────────

/**
 * Evaluate a residential zone center at (x, y).
 * Checks power, calculates desirability score, then grows or degrades.
 */
export function evaluateResidential(
	tileMap: TileMap,
	x: number,
	y: number,
	census: CensusData,
	blockMaps: BlockMaps,
	resValve: number,
): void {
	const rawTile = tileMap.get(x, y);
	const powered = (rawTile & POWERBIT) !== 0;
	const zonePop = getResZonePop(rawTile);
	const level = getResLevel(rawTile);

	// Track census
	census.resZonePop += 1;
	census.resPop += zonePop;

	if (powered) {
		census.poweredZoneCount += 1;
	} else {
		census.unpoweredZoneCount += 1;
	}

	// Only powered zones can grow; unpowered zones can only degrade
	if (!powered) {
		if (level > 0 && math.random(0, 15) === 0) {
			degradeResZone(tileMap, x, y, level, false);
		}
		return;
	}

	// Compute desirability score
	const landValue = blockMaps.landValueMap.worldGet(x, y);
	const pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
	const score = resValve + landValue - pollution;

	// Growth check
	if (score > 0 && level < RES_DENSITY_STEPS) {
		// Probability of growth increases with score
		const growChance = math.floor(score / 16) + 1;
		if (math.random(1, 32) <= growChance) {
			growResZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) + 1);
		}
	}

	// Decline check
	if (score < 0 && level > 0) {
		const declineChance = math.floor(-score / 16) + 1;
		if (math.random(1, 32) <= declineChance) {
			degradeResZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) - 1);
		}
	}
}

/**
 * Evaluate a commercial zone center at (x, y).
 */
export function evaluateCommercial(
	tileMap: TileMap,
	x: number,
	y: number,
	census: CensusData,
	blockMaps: BlockMaps,
	comValve: number,
): void {
	const rawTile = tileMap.get(x, y);
	const powered = (rawTile & POWERBIT) !== 0;
	const zonePop = getComZonePop(rawTile);
	const level = getComLevel(rawTile);

	census.comZonePop += 1;
	census.comPop += zonePop;

	if (powered) {
		census.poweredZoneCount += 1;
	} else {
		census.unpoweredZoneCount += 1;
	}

	if (!powered) {
		if (level > 0 && math.random(0, 15) === 0) {
			degradeComZone(tileMap, x, y, level, false);
		}
		return;
	}

	const landValue = blockMaps.landValueMap.worldGet(x, y);
	const pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
	const score = comValve + landValue - pollution;

	if (score > 0 && level < COM_DENSITY_STEPS) {
		const growChance = math.floor(score / 16) + 1;
		if (math.random(1, 32) <= growChance) {
			growComZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) + 1);
		}
	}

	if (score < 0 && level > 0) {
		const declineChance = math.floor(-score / 16) + 1;
		if (math.random(1, 32) <= declineChance) {
			degradeComZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) - 1);
		}
	}
}

/**
 * Evaluate an industrial zone center at (x, y).
 */
export function evaluateIndustrial(
	tileMap: TileMap,
	x: number,
	y: number,
	census: CensusData,
	blockMaps: BlockMaps,
	indValve: number,
): void {
	const rawTile = tileMap.get(x, y);
	const powered = (rawTile & POWERBIT) !== 0;
	const zonePop = getIndZonePop(rawTile);
	const level = getIndLevel(rawTile);

	census.indZonePop += 1;
	census.indPop += zonePop;

	if (powered) {
		census.poweredZoneCount += 1;
	} else {
		census.unpoweredZoneCount += 1;
	}

	if (!powered) {
		if (level > 0 && math.random(0, 15) === 0) {
			degradeIndZone(tileMap, x, y, level, false);
		}
		return;
	}

	const landValue = blockMaps.landValueMap.worldGet(x, y);
	const pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
	// Industrial zones are less affected by pollution and don't benefit as much from land value
	const score = indValve + math.floor(landValue / 2) - math.floor(pollution / 4);

	if (score > 0 && level < IND_DENSITY_STEPS) {
		const growChance = math.floor(score / 16) + 1;
		if (math.random(1, 32) <= growChance) {
			growIndZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) + 1);
		}
	}

	if (score < 0 && level > 0) {
		const declineChance = math.floor(-score / 16) + 1;
		if (math.random(1, 32) <= declineChance) {
			degradeIndZone(tileMap, x, y, level, true);
			blockMaps.rateOfGrowthMap.worldSet(x, y, blockMaps.rateOfGrowthMap.worldGet(x, y) - 1);
		}
	}
}

// ── Growth / degradation helpers ───────────────────────────────────────

function growResZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 0) {
		// Empty zone → first developed level
		placeZone3x3(tileMap, cx, cy, RZB, powered);
	} else if (currentLevel < RES_DENSITY_STEPS) {
		// Advance to next density level
		const newBase = RZB + currentLevel * RES_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

function degradeResZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 1) {
		// First developed → empty zone
		placeZone3x3(tileMap, cx, cy, FREEZ - 4, powered);
		// Actually set center to FREEZ with zone flags
		const flags = ZONEBIT | BULLBIT | BURNBIT | CONDBIT | (powered ? POWERBIT : 0);
		tileMap.set(cx, cy, FREEZ | flags);
	} else if (currentLevel > 1) {
		// Drop one density level
		const newBase = RZB + (currentLevel - 2) * RES_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

function growComZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 0) {
		placeZone3x3(tileMap, cx, cy, CZB, powered);
	} else if (currentLevel < COM_DENSITY_STEPS) {
		const newBase = CZB + currentLevel * COM_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

function degradeComZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 1) {
		placeZone3x3(tileMap, cx, cy, COMCLR - 4, powered);
		const flags = ZONEBIT | BULLBIT | BURNBIT | CONDBIT | (powered ? POWERBIT : 0);
		tileMap.set(cx, cy, COMCLR | flags);
	} else if (currentLevel > 1) {
		const newBase = CZB + (currentLevel - 2) * COM_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

function growIndZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 0) {
		placeZone3x3(tileMap, cx, cy, IZB, powered);
	} else if (currentLevel < IND_DENSITY_STEPS) {
		const newBase = IZB + currentLevel * IND_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

function degradeIndZone(tileMap: TileMap, cx: number, cy: number, currentLevel: number, powered: boolean): void {
	if (currentLevel === 1) {
		placeZone3x3(tileMap, cx, cy, INDCLR - 4, powered);
		const flags = ZONEBIT | BULLBIT | BURNBIT | CONDBIT | (powered ? POWERBIT : 0);
		tileMap.set(cx, cy, INDCLR | flags);
	} else if (currentLevel > 1) {
		const newBase = IZB + (currentLevel - 2) * IND_STEP_SIZE;
		placeZone3x3(tileMap, cx, cy, newBase, powered);
	}
}

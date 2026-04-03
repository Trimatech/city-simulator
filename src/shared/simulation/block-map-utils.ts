/**
 * Block map utility functions — port of micropolisJS blockMapUtils.js.
 *
 * These compute overlay maps (pollution, land value, crime, population density,
 * fire/police coverage) from the tile map at reduced resolution.
 */

import { MAP_HEIGHT, MAP_WIDTH } from "shared/constants/core";
import { BlockMap } from "./block-map";
import { TileMap } from "./tile-map";
import {
	COALBASE,
	FIREBASE,
	HTRFBASE,
	LASTIND,
	LASTPOWERPLANT,
	LTRFBASE,
	LOMASK,
	PORTBASE,
	POWERPLANT,
	RADTILE,
	ROADBASE,
	ZONEBIT,
	tileType,
} from "./tile-values";
import type { BlockMaps } from "./zone-eval";
import type { CensusData } from "./census";

// ── Pollution value lookup ────────────────────────────────────────────

function getPollutionValue(tileBase: number): number {
	if (tileBase >= FIREBASE) return 90;
	if (tileBase === RADTILE) return 255;
	if (tileBase >= HTRFBASE && tileBase < LTRFBASE) return 75;
	if (tileBase >= LTRFBASE && tileBase < HTRFBASE) return 50;
	if (tileBase >= LASTIND && tileBase < PORTBASE) return 50;
	if (tileBase >= COALBASE && tileBase <= LASTPOWERPLANT) return 100;
	return 0;
}

// ── Smooth helper ─────────────────────────────────────────────────────

/** Smooth a block map by averaging each cell with its 4 neighbours. */
function smoothBlockMap(src: BlockMap, dest: BlockMap): void {
	for (let by = 0; by < src.height; by++) {
		for (let bx = 0; bx < src.width; bx++) {
			const center = src.get(bx, by);
			const sum =
				center +
				src.get(bx - 1, by) +
				src.get(bx + 1, by) +
				src.get(bx, by - 1) +
				src.get(bx, by + 1);
			dest.set(bx, by, math.floor(sum / 5));
		}
	}
}

/** Smooth a block map in place using a temporary copy. */
function smoothInPlace(map: BlockMap): void {
	const temp = new BlockMap(map.width * map.blockSize, map.height * map.blockSize, map.blockSize);
	smoothBlockMap(map, temp);
	// Copy temp back to map
	for (let i = 0; i < map.data.size(); i++) {
		map.data[i] = temp.data[i];
	}
}

// ── Pollution, Terrain & Land Value Scan ──────────────────────────────

/**
 * Scan the tile map to compute pollution density, terrain density,
 * and land value overlay maps. Also locates the city centre.
 */
export function pollutionTerrainLandValueScan(
	tileMap: TileMap,
	census: CensusData,
	blockMaps: BlockMaps,
): void {
	const pollMap = blockMaps.pollutionDensityMap;
	const terrMap = blockMaps.terrainDensityMap;
	const lvMap = blockMaps.landValueMap;
	const ccMap = blockMaps.cityCentreDistScoreMap;

	// Clear maps before recomputing
	pollMap.clear();
	terrMap.clear();

	// Accumulate pollution and terrain from tile map
	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = 0; x < MAP_WIDTH; x++) {
			const rawTile = tileMap.get(x, y);
			const tBase = rawTile & LOMASK;

			// Pollution from tile type
			const pollVal = getPollutionValue(tBase);
			if (pollVal > 0) {
				const cur = pollMap.worldGet(x, y);
				pollMap.worldSet(x, y, math.min(cur + pollVal, 255));
			}

			// Terrain: undeveloped land (below ROADBASE) adds density
			if (tBase < ROADBASE) {
				const cur = terrMap.worldGet(x, y);
				terrMap.worldSet(x, y, math.min(cur + 15, 255));
			}
		}
	}

	// Smooth pollution 3 times
	smoothInPlace(pollMap);
	smoothInPlace(pollMap);
	smoothInPlace(pollMap);

	// Compute pollution average
	let pollSum = 0;
	let pollCount = 0;
	for (let i = 0; i < pollMap.data.size(); i++) {
		if (pollMap.data[i] > 0) {
			pollSum += pollMap.data[i];
			pollCount++;
		}
	}
	census.pollutionAverage = pollCount > 0 ? math.floor(pollSum / pollCount) : 0;

	// Compute city centre from population density map
	let centreX = math.floor(MAP_WIDTH / 2);
	let centreY = math.floor(MAP_HEIGHT / 2);
	const popMap = blockMaps.populationDensityMap;
	let popWeightX = 0;
	let popWeightY = 0;
	let popTotal = 0;
	for (let by = 0; by < popMap.height; by++) {
		for (let bx = 0; bx < popMap.width; bx++) {
			const pop = popMap.get(bx, by);
			if (pop > 0) {
				popWeightX += bx * pop;
				popWeightY += by * pop;
				popTotal += pop;
			}
		}
	}
	if (popTotal > 0) {
		centreX = math.floor((popWeightX / popTotal) * popMap.blockSize);
		centreY = math.floor((popWeightY / popTotal) * popMap.blockSize);
	}

	// Fill city centre distance score map
	for (let by = 0; by < ccMap.height; by++) {
		for (let bx = 0; bx < ccMap.width; bx++) {
			const wx = bx * ccMap.blockSize;
			const wy = by * ccMap.blockSize;
			const dist = math.abs(wx - centreX) + math.abs(wy - centreY);
			const score = math.clamp(64 - math.floor(dist / 2), -64, 64);
			ccMap.set(bx, by, score);
		}
	}

	// Compute land value map for developed blocks
	for (let by = 0; by < lvMap.height; by++) {
		for (let bx = 0; bx < lvMap.width; bx++) {
			// Check if block has any developed tiles
			let developed = false;
			for (let dy = 0; dy < lvMap.blockSize && !developed; dy++) {
				for (let dx = 0; dx < lvMap.blockSize && !developed; dx++) {
					const wx = bx * lvMap.blockSize + dx;
					const wy = by * lvMap.blockSize + dy;
					if (wx < MAP_WIDTH && wy < MAP_HEIGHT) {
						const t = tileMap.getTileType(wx, wy);
						if (t >= ROADBASE) developed = true;
					}
				}
			}

			if (!developed) {
				lvMap.set(bx, by, 0);
				continue;
			}

			// Base land value from distance to city centre
			const ccScore = ccMap.get(
				math.floor((bx * lvMap.blockSize) / ccMap.blockSize),
				math.floor((by * lvMap.blockSize) / ccMap.blockSize),
			);
			let landVal = ccScore + 34;

			// Add terrain bonus
			const terrVal = terrMap.get(
				math.floor((bx * lvMap.blockSize) / terrMap.blockSize),
				math.floor((by * lvMap.blockSize) / terrMap.blockSize),
			);
			landVal += math.floor(terrVal / 4);

			// Subtract pollution
			const pollVal = pollMap.get(
				math.floor((bx * lvMap.blockSize) / pollMap.blockSize),
				math.floor((by * lvMap.blockSize) / pollMap.blockSize),
			);
			landVal -= pollVal;

			// Crime penalty
			const crimeVal = blockMaps.crimeRateMap.get(
				math.floor((bx * lvMap.blockSize) / blockMaps.crimeRateMap.blockSize),
				math.floor((by * lvMap.blockSize) / blockMaps.crimeRateMap.blockSize),
			);
			if (crimeVal > 190) landVal -= 20;

			landVal = math.clamp(landVal, 1, 250);
			lvMap.set(bx, by, landVal);
		}
	}

	// Compute land value average
	let lvSum = 0;
	let lvCount = 0;
	for (let i = 0; i < lvMap.data.size(); i++) {
		if (lvMap.data[i] > 0) {
			lvSum += lvMap.data[i];
			lvCount++;
		}
	}
	census.landValueAverage = lvCount > 0 ? math.floor(lvSum / lvCount) : 0;
}

// ── Crime Scan ────────────────────────────────────────────────────────

/**
 * Calculate crime rates from land value, population density, and police coverage.
 */
export function crimeScan(census: CensusData, blockMaps: BlockMaps): void {
	const crimeMap = blockMaps.crimeRateMap;
	const policeMap = blockMaps.policeStationMap;
	const policeEffMap = blockMaps.policeStationEffectMap;
	const lvMap = blockMaps.landValueMap;
	const popMap = blockMaps.populationDensityMap;

	// Smooth police station map 3 times into effect map
	smoothBlockMap(policeMap, policeEffMap);
	smoothInPlace(policeEffMap);
	smoothInPlace(policeEffMap);

	let crimeSum = 0;
	let crimeCount = 0;

	for (let by = 0; by < crimeMap.height; by++) {
		for (let bx = 0; bx < crimeMap.width; bx++) {
			// Look up population density at this block's world coords
			const wx = bx * crimeMap.blockSize;
			const wy = by * crimeMap.blockSize;
			const popDens = popMap.worldGet(wx, wy);

			if (popDens === 0) {
				crimeMap.set(bx, by, 0);
				continue;
			}

			// Base crime: inverse of land value
			const lv = lvMap.worldGet(wx, wy);
			let crime = 128 - lv;

			// Population pressure
			crime += math.floor(popDens / 2);

			// Police coverage reduces crime
			const policeEffect = policeEffMap.get(
				math.floor(wx / policeEffMap.blockSize),
				math.floor(wy / policeEffMap.blockSize),
			);
			crime -= policeEffect;

			crime = math.clamp(crime, 0, 250);
			crimeMap.set(bx, by, crime);

			crimeSum += crime;
			crimeCount++;
		}
	}

	census.crimeAverage = crimeCount > 0 ? math.floor(crimeSum / crimeCount) : 0;
}

// ── Population Density Scan ───────────────────────────────────────────

/**
 * Build population density map from zone tiles.
 */
export function populationDensityScan(tileMap: TileMap, blockMaps: BlockMaps): void {
	const popMap = blockMaps.populationDensityMap;
	popMap.clear();

	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = 0; x < MAP_WIDTH; x++) {
			const rawTile = tileMap.get(x, y);
			if ((rawTile & ZONEBIT) === 0) continue;

			const tBase = rawTile & LOMASK;
			let pop = 0;

			// Residential zones
			if (tBase >= 240 && tBase < 423) {
				pop = 8; // Simplified: each res zone = 8 density units
			}
			// Commercial zones
			else if (tBase >= 423 && tBase < 612) {
				pop = 6;
			}
			// Industrial zones
			else if (tBase >= 612 && tBase < 693) {
				pop = 6;
			}

			if (pop > 0) {
				const scaledPop = math.min(pop * 8, 254);
				const cur = popMap.worldGet(x, y);
				popMap.worldSet(x, y, math.min(cur + scaledPop, 254));
			}
		}
	}

	// Smooth 3 times
	smoothInPlace(popMap);
	smoothInPlace(popMap);
	smoothInPlace(popMap);
}

// ── Fire Analysis ─────────────────────────────────────────────────────

/**
 * Smooth fire station coverage into effect map.
 */
export function fireAnalysis(blockMaps: BlockMaps): void {
	smoothBlockMap(blockMaps.fireStationMap, blockMaps.fireStationEffectMap);
	smoothInPlace(blockMaps.fireStationEffectMap);
	smoothInPlace(blockMaps.fireStationEffectMap);
}

// ── Neutralise helpers ────────────────────────────────────────────────

/**
 * Decay rate of growth map values toward zero.
 */
export function neutraliseRateOfGrowthMap(blockMaps: BlockMaps): void {
	const rogMap = blockMaps.rateOfGrowthMap;
	for (let i = 0; i < rogMap.data.size(); i++) {
		let val = rogMap.data[i];
		if (val > 0) val--;
		else if (val < 0) val++;
		rogMap.data[i] = math.clamp(val, -200, 200);
	}
}

/**
 * Decay traffic density over time.
 */
export function neutraliseTrafficMap(blockMaps: BlockMaps): void {
	const tMap = blockMaps.trafficDensityMap;
	for (let i = 0; i < tMap.data.size(); i++) {
		let val = tMap.data[i];
		if (val <= 24) {
			val = 0;
		} else if (val > 200) {
			val -= 34;
		} else {
			val -= 24;
		}
		tMap.data[i] = math.max(val, 0);
	}
}

/**
 * Power grid scanner — port of the Micropolis power manager.
 *
 * Performs a flood-fill from power plants (coal / nuclear) through
 * conductive tiles to determine which zones receive power.
 */

import { MAP_HEIGHT, MAP_WIDTH } from "shared/constants/core";
import { BlockMap } from "shared/simulation/block-map";
import { TileMap } from "shared/simulation/tile-map";
import { CONDBIT, LOMASK, NUCLEAR, POWERBIT, POWERPLANT } from "shared/simulation/tile-values";

// ── Constants ──────────────────────────────────────────────────────────
const COAL_POWER_STRENGTH = 700;
const NUCLEAR_POWER_STRENGTH = 2000;

/** Power-grid block resolution — 1 block = 1 tile for precise coverage. */
const POWER_BLOCK_SIZE = 1;

// ── Census interface ───────────────────────────────────────────────────

export interface CensusData {
	coalPowerPop: number;
	nuclearPowerPop: number;
}

// ── Direction offsets for 4-way adjacency ──────────────────────────────
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Scan the tile map for power plants and flood-fill power through
 * conductive tiles. Returns a BlockMap where non-zero entries indicate
 * that the corresponding tile has power coverage.
 *
 * Side-effects:
 *  - Clears and re-sets the POWERBIT on every tile in tileMap.
 */
export function doPowerScan(tileMap: TileMap, census: CensusData): BlockMap {
	const powerGridMap = new BlockMap(MAP_WIDTH, MAP_HEIGHT, POWER_BLOCK_SIZE);

	// 1. Calculate total available power from census counts.
	const maxPower =
		census.coalPowerPop * COAL_POWER_STRENGTH +
		census.nuclearPowerPop * NUCLEAR_POWER_STRENGTH;

	// 2. Collect power-plant positions by scanning the map.
	const powerStack: Array<{ x: number; y: number }> = [];

	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = 0; x < MAP_WIDTH; x++) {
			const tileVal = tileMap.get(x, y);
			const tileBase = tileVal & LOMASK;

			if (tileBase === POWERPLANT || tileBase === NUCLEAR) {
				powerStack.push({ x, y });
			}
		}
	}

	// 3. Clear the POWERBIT on every tile before recomputing.
	tileMap.clearPowerBits();

	// 4. Flood-fill from each power plant through conductive tiles.
	let consumed = 0;

	// visited[y * MAP_WIDTH + x] = true when tile has been processed
	const visited: boolean[] = table.create(MAP_WIDTH * MAP_HEIGHT, false);

	// BFS queue for the flood fill
	const queue: Array<{ x: number; y: number }> = [];

	// Seed the queue with all power plant locations.
	for (const plant of powerStack) {
		const idx = plant.y * MAP_WIDTH + plant.x;
		if (!visited[idx]) {
			visited[idx] = true;
			queue.push(plant);
			powerGridMap.set(plant.x, plant.y, 1);
		}
	}

	while (queue.size() > 0) {
		const current = queue.remove(0)!;

		for (let d = 0; d < 4; d++) {
			const nx = current.x + DX[d];
			const ny = current.y + DY[d];

			if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue;

			const nIdx = ny * MAP_WIDTH + nx;
			if (visited[nIdx]) continue;

			const neighborTile = tileMap.get(nx, ny);

			// Only spread through conductive tiles.
			if ((neighborTile & CONDBIT) === 0) continue;

			visited[nIdx] = true;
			consumed++;

			if (consumed > maxPower) {
				// Out of power — stop spreading but continue to mark
				// what we have already reached.
				continue;
			}

			powerGridMap.set(nx, ny, 1);
			queue.push({ x: nx, y: ny });
		}
	}

	// 5. Set POWERBIT on tiles that have coverage in the power grid map.
	for (let y = 0; y < MAP_HEIGHT; y++) {
		for (let x = 0; x < MAP_WIDTH; x++) {
			if (powerGridMap.get(x, y) > 0) {
				const tile = tileMap.get(x, y);
				tileMap.setRaw(x, y, tile | POWERBIT);
			}
		}
	}

	return powerGridMap;
}

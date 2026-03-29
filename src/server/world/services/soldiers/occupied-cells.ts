import { store } from "server/store";
import { WORLD_BOUNDS } from "shared/constants/core";
import { selectAliveSoldiersById } from "shared/store/soldiers";
import { getCellCoordFromPos, getCellKeyFromCoord } from "shared/utils/cell-key";

const GRID_RESOLUTION = 20;
const BOUND_LIMIT = WORLD_BOUNDS * 0.8;
const BOUND_LIMIT_SQ = BOUND_LIMIT * BOUND_LIMIT;

/**
 * Fast ray-casting point-in-polygon (avoids polybool overhead).
 */
function isInsidePolygon(px: number, py: number, polygon: ReadonlyArray<Vector2>): boolean {
	let inside = false;
	for (let i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
		const xi = polygon[i].X;
		const yi = polygon[i].Y;
		const xj = polygon[j].X;
		const yj = polygon[j].Y;
		if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
			inside = !inside;
		}
	}
	return inside;
}

/**
 * Build occupied cell set from all alive soldiers' polygons on-demand.
 * Only called at spawn time, not on every polygon update.
 */
function buildOccupiedCells(): Set<string> {
	const occupied = new Set<string>();
	const aliveById = store.getState(selectAliveSoldiersById);

	for (const [, soldier] of pairs(aliveById)) {
		const polygon = soldier.polygon as ReadonlyArray<Vector2> | undefined;
		if (!polygon || polygon.size() < 3) continue;

		// Bounding box of polygon
		let minX = math.huge;
		let minY = math.huge;
		let maxX = -math.huge;
		let maxY = -math.huge;
		for (const v of polygon) {
			minX = math.min(minX, v.X);
			minY = math.min(minY, v.Y);
			maxX = math.max(maxX, v.X);
			maxY = math.max(maxY, v.Y);
		}

		const minCoord = getCellCoordFromPos(new Vector2(minX, minY), GRID_RESOLUTION);
		const maxCoord = getCellCoordFromPos(new Vector2(maxX, maxY), GRID_RESOLUTION);

		for (let cx = minCoord.X; cx <= maxCoord.X; cx++) {
			for (let cy = minCoord.Y; cy <= maxCoord.Y; cy++) {
				const centerX = (cx + 0.5) * GRID_RESOLUTION;
				const centerY = (cy + 0.5) * GRID_RESOLUTION;
				if (isInsidePolygon(centerX, centerY, polygon)) {
					occupied.add(getCellKeyFromCoord(new Vector2(cx, cy)));
				}
			}
		}
	}

	return occupied;
}

/**
 * Compute the centroid of all alive soldiers for proximity-aware spawning.
 */
function getAliveSoldiersCentroid(): Vector2 | undefined {
	const aliveById = store.getState(selectAliveSoldiersById);
	let sumX = 0;
	let sumY = 0;
	let count = 0;

	for (const [, soldier] of pairs(aliveById)) {
		if (soldier.position) {
			sumX += soldier.position.X;
			sumY += soldier.position.Y;
			count++;
		}
	}

	if (count === 0) return undefined;
	return new Vector2(sumX / count, sumY / count);
}

const EMPTY_CELL_SAMPLE_ATTEMPTS = 50;

/**
 * Find a random empty cell position within world bounds, preferring cells
 * closer to other alive soldiers. Computes occupied cells on-demand.
 * Returns the cell center as a Vector2, or undefined if no empty cells found.
 */
export function getRandomEmptyCellPosition(): Vector2 | undefined {
	const occupied = buildOccupiedCells();
	const centroid = getAliveSoldiersCentroid();
	const random = new Random();
	const maxCoord = math.floor(BOUND_LIMIT / GRID_RESOLUTION);

	let best: Vector2 | undefined;
	let bestDistSq = math.huge;

	for (const _ of $range(1, EMPTY_CELL_SAMPLE_ATTEMPTS)) {
		const cx = random.NextInteger(-maxCoord, maxCoord);
		const cy = random.NextInteger(-maxCoord, maxCoord);
		const centerX = (cx + 0.5) * GRID_RESOLUTION;
		const centerY = (cy + 0.5) * GRID_RESOLUTION;

		if (centerX * centerX + centerY * centerY > BOUND_LIMIT_SQ) continue;

		const key = getCellKeyFromCoord(new Vector2(cx, cy));
		if (occupied.has(key)) continue;

		const pos = new Vector2(centerX, centerY);

		// If no centroid (no alive players), return first empty cell found
		if (!centroid) return pos;

		// Track the closest empty cell to the centroid of alive soldiers
		const dx = centerX - centroid.X;
		const dy = centerY - centroid.Y;
		const distSq = dx * dx + dy * dy;
		if (distSq < bestDistSq) {
			best = pos;
			bestDistSq = distSq;
		}
	}

	return best;
}

/**
 * Find a random position at the edge of any soldier's territory.
 * Used as fallback when no empty cells exist (map is mostly claimed).
 * Returns a position just outside a random occupied boundary cell.
 */
export function getEdgeSpawnPosition(): Vector2 | undefined {
	const occupied = buildOccupiedCells();
	const random = new Random();

	const directions = [new Vector2(1, 0), new Vector2(-1, 0), new Vector2(0, 1), new Vector2(0, -1)];

	// Find boundary cells: unoccupied cells adjacent to occupied ones
	const boundaryCells: Vector2[] = [];

	occupied.forEach((cellKey) => {
		const parts = cellKey.split(",");
		const cx = tonumber(parts[0])!;
		const cy = tonumber(parts[1])!;

		for (const dir of directions) {
			const nx = cx + dir.X;
			const ny = cy + dir.Y;
			const neighborKey = getCellKeyFromCoord(new Vector2(nx, ny));
			if (!occupied.has(neighborKey)) {
				const neighborCenterX = (nx + 0.5) * GRID_RESOLUTION;
				const neighborCenterY = (ny + 0.5) * GRID_RESOLUTION;
				if (neighborCenterX * neighborCenterX + neighborCenterY * neighborCenterY <= BOUND_LIMIT_SQ) {
					boundaryCells.push(new Vector2(neighborCenterX, neighborCenterY));
				}
				break;
			}
		}
	});

	if (boundaryCells.size() === 0) return undefined;
	return boundaryCells[random.NextInteger(0, boundaryCells.size() - 1)];
}

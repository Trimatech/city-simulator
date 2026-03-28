import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { CANDY_LIMITS } from "server/world/constants";
import { getRandomPointInWorld, getSoldier } from "server/world/world-query.utils";
import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { getRandomAccent } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import {
	selectCandyGridCells,
	selectCandyGridCount,
	selectCandyGridResolution,
} from "shared/store/candy-grid/candy-grid-selectors";
import { CandyEntity, CandyType } from "shared/store/candy-grid/candy-types";
import { selectSoldierOrbs, SOLDIER_RADIUS_BASE } from "shared/store/soldiers";
import { Grid, GridPoint } from "shared/utils/grid";
import { fillArray } from "shared/utils/object-utils";
import { getPlayerByName } from "shared/utils/player-utils";

import { createCandyPart, markCandyEaten, removeCandyPart } from "./candy-part-manager";
import {
	addCandies,
	addCandy as addCandyLocal,
	getCandy as getCandyLocal,
	removeCandyLocal,
	setCandyEatenAtLocal,
} from "./candy-store";

const random = new Random();

export const candyGrid = new Grid<{ id: string }>(5);

let nextCandyId = 0;

const TIMEOUT_DELAY = 2;

export function createCandy(patch?: Partial<CandyEntity>): CandyEntity {
	const random = new Random();

	const candy: CandyEntity = {
		id: `${nextCandyId++}`,
		type: CandyType.Default,
		size: math.min(random.NextInteger(1, 4), random.NextInteger(1, 5)),
		position: getRandomPointInWorld(0.98),
		color: getRandomAccent(),
		...patch,
	};

	// print(
	// 	`[DEBUG] Creating candy ID: ${candy.id}, Position: (${candy.position.X}, ${candy.position.Y}), Type: ${candy.type}`,
	// );

	candyGrid.insert(candy.position, { id: candy.id });
	addCandyLocal(candy);

	// Create server-side Part for this candy
	createCandyPart(candy);

	return candy;
}

function getCandyCellKeyForPosition(position: Vector2) {
	const state = store.getState();
	const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
	const res = resolution > 0 ? resolution : candyGrid.resolution;
	const x = math.floor(position.X / res);
	const y = math.floor(position.Y / res);
	return `${x},${y}`;
}

function patchCandyCell(cellKey: string, apply: (cell: { [id: string]: CandyEntity | undefined }) => void) {
	const state = store.getState();
	const cells = selectCandyGridCells({ candyGrid: state.candyGrid });
	const nextp = { ...(cells[cellKey] ?? {}) } as { [id: string]: CandyEntity | undefined };
	apply(nextp);
	store.setCandyCell(cellKey, nextp);
}

function markCandyEatenInGrid(id: string, position: Vector2) {
	const cellKey = getCandyCellKeyForPosition(position);
	patchCandyCell(cellKey, (cell) => {
		const existing = cell[id] ?? getCandyLocal(id)!;
		cell[id] = { ...existing, eatenAt: position };
	});
}

function markCandiesEatenInGrid(entries: { id: string; position: Vector2 }[]) {
	if (entries.size() === 0) return;
	const byCell: { [cellKey: string]: { id: string; position: Vector2 }[] } = {};
	for (const e of entries as unknown as { id: string; position: Vector2 }[]) {
		const key = getCandyCellKeyForPosition(e.position);
		(byCell[key] ||= []).push(e);
	}
	for (const [cellKey, group] of pairs(byCell)) {
		patchCandyCell(cellKey as string, (cell) => {
			for (const e of group as unknown as { id: string; position: Vector2 }[]) {
				const existing = cell[e.id] ?? getCandyLocal(e.id)!;
				cell[e.id] = { ...existing, eatenAt: e.position };
			}
		});
	}
}

export function removeCandy(id: string, eatenAt?: Vector2) {
	const candy = getCandyLocal(id);

	if (!candy) {
		print(`[DEBUG] removeCandy: Candy ${id} not found in local store`);
		return;
	}

	//	print(`[DEBUG] Removing candy ID: ${candy.id}, Position: (${candy.position.X}, ${candy.position.Y})`);

	setCandyEatenAtLocal(id, eatenAt ?? candy.position);
	candyGrid.remove(candy.position);

	// Immediately mark as eaten in replicated grid so clients animate
	markCandyEatenInGrid(id, eatenAt ?? candy.position);

	// Mark the server-side Part as eaten (client will animate)
	markCandyEaten(id);

	setTimeout(() => {
		const cellKeyToRemove = getCandyCellKeyForPosition(candy.position);
		patchCandyCell(cellKeyToRemove, (cell) => {
			cell[id] = undefined;
		});
		removeCandyLocal(id);
		// Remove the server-side Part
		removeCandyPart(id);
		//print(`[DEBUG] Candy ${id} fully removed after timeout`);
	}, TIMEOUT_DELAY);
}

function fireOrbsWastedIfNeeded(soldierId: string, orbsToAdd: number) {
	const currentOrbs = store.getState(selectSoldierOrbs(soldierId)) ?? 0;
	const wasted = currentOrbs + orbsToAdd - SOLDIER_MAX_ORBS;
	if (wasted > 0) {
		const player = getPlayerByName(soldierId);
		if (player) {
			remotes.client.orbsWasted.fire(player, wasted);
		}
	}
}

export function eatCandy(candyId: string, soldierId: string) {
	const candy = getCandyLocal(candyId);
	const soldier = getSoldier(soldierId);

	if (soldier && candy && !candy.eatenAt) {
		//	print(`Candy eaten with id ${candy.id}`);
		removeCandy(candy.id, soldier.position);
		fireOrbsWastedIfNeeded(soldier.id, candy.size);
		store.incrementSoldierOrbs(soldier.id, candy.size);
	}
}

export function eatCandies(candyPoints: GridPoint<{ id: string }>[], soldierId: string) {
	if (candyPoints.size() === 0) return;

	// Collect all valid candies and their data
	const candyUpdates = candyPoints.mapFiltered((point) => {
		const candy = getCandyLocal(point.metadata.id);
		if (!candy || candy.eatenAt) return undefined;

		return {
			id: candy.id,
			position: candy.position,
			size: candy.size,
		};
	});

	if (candyUpdates.size() === 0) return;

	// Calculate total orbs
	const totalOrbs = candyUpdates.reduce((sum, candy) => sum + candy.size, 0);

	// Remove from grid
	for (const candy of candyUpdates) {
		candyGrid.remove(candy.position);
	}

	// Eaten positions for replication + later cleanup
	// const candyIds = candyUpdates.map((c) => c.id);
	const eatenPositions = candyUpdates.map((c) => ({
		id: c.id,
		position: c.position,
	}));
	fireOrbsWastedIfNeeded(soldierId, totalOrbs);
	store.incrementSoldierOrbs(soldierId, totalOrbs);

	// Immediately mark as eaten in replicated grid so clients animate
	markCandiesEatenInGrid(eatenPositions);

	// Mark server-side Parts as eaten (client will animate)
	for (const { id } of eatenPositions) {
		markCandyEaten(id);
	}

	// Schedule removal from replicated candy grid and state
	setTimeout(() => {
		const state = store.getState();
		const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
		const res = resolution > 0 ? resolution : candyGrid.resolution;

		// Group removals by cell (by id only to avoid stale entity lookups)
		const byCell: { [cellKey: string]: string[] } = {};
		for (const { id, position } of eatenPositions) {
			const x = math.floor(position.X / res);
			const y = math.floor(position.Y / res);
			const key = `${x},${y}`;
			(byCell[key] ||= new Array<string>()).push(id);
		}

		const currentCells = selectCandyGridCells({ candyGrid: state.candyGrid });
		for (const [cellKey, ids] of pairs(byCell)) {
			const current = { ...(currentCells[cellKey as string] ?? {}) } as { [id: string]: CandyEntity | undefined };
			for (const candyId of ids as unknown as string[]) {
				current[candyId] = undefined;
				removeCandyLocal(candyId);
				// Remove the server-side Part
				removeCandyPart(candyId);
			}
			store.setCandyCell(cellKey as string, current);
		}
	}, TIMEOUT_DELAY);
}

export function populateCandy(amount: number) {
	const candies = fillArray(amount, () => createCandy());
	addCandies(candies);

	// Update replicated candy grid cells with new ids
	const state = store.getState();
	const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
	const res = resolution > 0 ? resolution : candyGrid.resolution;
	const byCell: { [cellKey: string]: { [id: string]: CandyEntity } } = {};
	for (const c of candies) {
		const x = math.floor(c.position.X / res);
		const y = math.floor(c.position.Y / res);
		const key = `${x},${y}`;
		(byCell[key] ||= {})[c.id] = c;
	}
	const cells = selectCandyGridCells({ candyGrid: store.getState().candyGrid });
	for (const [cellKey, newIds] of pairs(byCell)) {
		const current = { ...(cells[cellKey as string] ?? {}) } as { [id: string]: CandyEntity | undefined };
		for (const [nid, entity] of pairs(newIds as unknown as { [id: string]: CandyEntity })) {
			current[nid as string] = entity as CandyEntity;
		}
		store.setCandyCell(cellKey as string, current);
	}
}

export function removeCandyIfAtLimit(candyType: CandyType) {
	const max = CANDY_LIMITS[candyType];
	const count = store.getState(selectCandyGridCount(candyType));

	if (count > max) {
		// Remove oldest by id order
		const state = store.getState();
		const cells = selectCandyGridCells({ candyGrid: state.candyGrid });
		const all: CandyEntity[] = [];
		for (const [, cell] of pairs(cells)) {
			if (!cell) continue;
			for (const [, candy] of pairs(cell)) {
				if (candy && candy.type === candyType && !candy.eatenAt) all.push(candy);
			}
		}
		all.sort((a, b) => tonumber(a.id)! < tonumber(b.id)!);
		const toRemove = count - max;
		for (let i = 0; i < toRemove && i < all.size(); i++) {
			removeCandy(all[i].id);
		}
	}
}

function sampleCandySize(maxAvailable: number) {
	const roll = random.NextNumber(0, 1);
	let size = 1;
	if (roll < 0.4) {
		size = 1; // 40%
	} else if (roll < 0.65) {
		size = 2; // 25%
	} else if (roll < 0.83) {
		size = 3; // 18%
	} else if (roll < 0.93) {
		size = 4; // 10%
	} else {
		size = 5; // 7%
	}
	return math.min(size, maxAvailable);
}

const CANDY_SPACING = 5;
const MAX_CANDY_DROPS = 200;

/**
 * Drops candy loot evenly along a path of points.
 * Minimizes candy count by increasing size per candy when orbs are plentiful.
 */
export function dropCandyAlongPath(path: readonly Vector2[], orbBudget: number): void {
	if (path.size() < 2 || orbBudget <= 0) return;

	// Calculate total path length
	let totalLength = 0;
	for (let i = 0; i < path.size() - 1; i++) {
		totalLength += path[i + 1].sub(path[i]).Magnitude;
	}
	if (totalLength <= 0) return;

	// Determine number of positions based on path length, capped by budget and max
	const positionCount = math.clamp(math.ceil(totalLength / CANDY_SPACING), 2, MAX_CANDY_DROPS);
	// Size per candy: spread orbs across positions, clamped 1-5
	const sizePerCandy = math.clamp(math.floor(orbBudget / positionCount), 1, 5);
	// Actual count we can afford at this size
	const candyCount = math.min(positionCount, math.floor(orbBudget / sizePerCandy));
	const spacing = totalLength / (candyCount + 1);

	const candies: CandyEntity[] = [];
	let traveled = 0;
	let segIndex = 0;
	let placed = 0;
	let nextTarget = spacing;

	while (placed < candyCount && segIndex < path.size() - 1) {
		const segStart = path[segIndex];
		const segEnd = path[segIndex + 1];
		const segLen = segEnd.sub(segStart).Magnitude;

		while (nextTarget <= traveled + segLen && placed < candyCount) {
			const t = (nextTarget - traveled) / segLen;
			const pos = segStart.add(segEnd.sub(segStart).mul(t));
			candies.push(
				createCandy({
					position: pos,
					type: CandyType.Loot,
					size: sizePerCandy,
				}),
			);
			placed++;
			nextTarget += spacing;
		}

		traveled += segLen;
		segIndex++;
	}

	if (candies.size() === 0) return;

	addCandies(candies);
	const state = store.getState();
	const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
	const res = resolution > 0 ? resolution : candyGrid.resolution;
	const byCell: { [cellKey: string]: { [id: string]: CandyEntity } } = {};
	for (const c of candies) {
		const x = math.floor(c.position.X / res);
		const y = math.floor(c.position.Y / res);
		const key = `${x},${y}`;
		(byCell[key] ||= {})[c.id] = c;
	}
	const cells = selectCandyGridCells({ candyGrid: store.getState().candyGrid });
	for (const [cellKey, newIds] of pairs(byCell)) {
		const current = { ...(cells[cellKey as string] ?? {}) } as { [id: string]: CandyEntity | undefined };
		for (const [nid, entity] of pairs(newIds as unknown as { [id: string]: CandyEntity })) {
			current[nid as string] = entity as CandyEntity;
		}
		store.setCandyCell(cellKey as string, current);
	}
}

function polygonToPath(polygon: readonly Vector2[]): Vector2[] {
	// Close the polygon loop: [v0, v1, ..., vN, v0]
	return [...polygon, polygon[0]];
}

export function dropCandyOnDeath(id: string): void {
	const soldier = getSoldier(id);
	if (!soldier) return;

	const polygon = soldier.polygon as Vector2[];
	const orbBudget = math.max(0, soldier.orbs);

	if (polygon.size() > 2) {
		dropCandyAlongPath(polygonToPath(polygon), orbBudget);
	} else {
		// No polygon — scatter around position
		const radius = SOLDIER_RADIUS_BASE;
		const candies: CandyEntity[] = [];
		let remaining = orbBudget;
		const fallbackCount = 20;
		for (const _ of $range(1, fallbackCount)) {
			if (remaining <= 0) break;
			const size = sampleCandySize(remaining);
			const x = random.NextNumber(-1, 1) * radius;
			const y = random.NextNumber(-1, 1) * radius;
			candies.push(
				createCandy({
					position: soldier.position.add(new Vector2(x, y)),
					type: CandyType.Loot,
					size,
				}),
			);
			remaining -= size;
		}
		if (candies.size() === 0) return;

		addCandies(candies);
		const state = store.getState();
		const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
		const res = resolution > 0 ? resolution : candyGrid.resolution;
		const byCell: { [cellKey: string]: { [id: string]: CandyEntity } } = {};
		for (const c of candies) {
			const cx = math.floor(c.position.X / res);
			const cy = math.floor(c.position.Y / res);
			const key = `${cx},${cy}`;
			(byCell[key] ||= {})[c.id] = c;
		}
		const cells = selectCandyGridCells({ candyGrid: store.getState().candyGrid });
		for (const [cellKey, newIds] of pairs(byCell)) {
			const current = { ...(cells[cellKey as string] ?? {}) } as { [id: string]: CandyEntity | undefined };
			for (const [nid, entity] of pairs(newIds as unknown as { [id: string]: CandyEntity })) {
				current[nid as string] = entity as CandyEntity;
			}
			store.setCandyCell(cellKey as string, current);
		}
	}
}

export function addCandyEntity(entity: CandyEntity) {
	addCandyLocal(entity);
	const state = store.getState();
	const resolution = selectCandyGridResolution({ candyGrid: state.candyGrid });
	const res = resolution > 0 ? resolution : candyGrid.resolution;
	const x = math.floor(entity.position.X / res);
	const y = math.floor(entity.position.Y / res);
	const key = `${x},${y}`;
	const cells = selectCandyGridCells({ candyGrid: state.candyGrid });
	const current = { ...(cells[key] ?? {}) } as { [id: string]: CandyEntity | undefined };
	current[entity.id] = entity;
	store.setCandyCell(key, current);
}

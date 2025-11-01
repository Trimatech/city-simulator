import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { CANDY_LIMITS } from "server/world/constants";
import { getCandy, getRandomPointNearWorldOrigin, getSoldier } from "server/world/world.utils";
import { getRandomAccent } from "shared/constants/palette";
import { CandyEntity, CandyType, selectCandyById, selectCandyCount } from "shared/store/candy";
import { SOLDIER_RADIUS_BASE } from "shared/store/soldiers";
import { Grid, GridPoint } from "shared/utils/grid";
import { fillArray } from "shared/utils/object-utils";

const random = new Random();

export const candyGrid = new Grid<{ id: string }>(5);

let nextCandyId = 0;

export function createCandy(patch?: Partial<CandyEntity>): CandyEntity {
	const random = new Random();

	const candy: CandyEntity = {
		id: `${nextCandyId++}`,
		type: CandyType.Default,
		size: math.min(random.NextInteger(1, 4), random.NextInteger(1, 5)),
		position: getRandomPointNearWorldOrigin(0.98),
		color: getRandomAccent(),
		...patch,
	};

	candyGrid.insert(candy.position, { id: candy.id });

	return candy;
}

export function removeCandy(id: string, eatenAt?: Vector2) {
	const candy = store.getState(selectCandyById(id));

	if (!candy) {
		return;
	}

	store.setCandyEatenAt(id, eatenAt ?? candy.position);
	candyGrid.remove(candy.position);

	setTimeout(() => {
		store.removeCandy(id);
	}, 2);
}

export function eatCandy(candyId: string, soldierId: string) {
	const candy = getCandy(candyId);
	const soldier = getSoldier(soldierId);

	if (soldier && candy && !candy.eatenAt) {
		print(`Candy eaten with id ${candy.id}`);
		removeCandy(candy.id, soldier.position);
		store.incrementSoldierOrbs(soldier.id, candy.size);
	}
}

export function eatCandies(candyPoints: GridPoint<{ id: string }>[], soldierId: string) {
	if (candyPoints.size() === 0) return;

	// Collect all valid candies and their data
	const candyUpdates = candyPoints.mapFiltered((point) => {
		const candy = getCandy(point.metadata.id);
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

	// Bulk updates to store
	const candyIds = candyUpdates.map((c) => c.id);
	const eatenPositions = candyUpdates.map((c) => ({
		id: c.id,
		position: c.position,
	}));

	store.setCandiesEatenAt(eatenPositions);
	store.incrementSoldierOrbs(soldierId, totalOrbs);

	// Schedule removal from state
	setTimeout(() => {
		store.removeCandiesByIds(candyIds);
	}, 5);
}

export function populateCandy(amount: number) {
	store.populateCandy(fillArray(amount, () => createCandy()));
}

export function removeCandyIfAtLimit(candyType: CandyType) {
	const max = CANDY_LIMITS[candyType];
	const count = store.getState(selectCandyCount(candyType));

	if (count > max) {
		store.bulkRemoveStaleCandy(candyType, count - max);
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

export function dropCandyOnDeath(id: string): void {
	const soldier = getSoldier(id);

	if (!soldier) {
		return;
	}

	const polygon = soldier.polygon as Vector2[];
	const hasPolygon = polygon.size() > 2;

	let remainingOrbs = math.max(0, soldier.orbs);
	const candies: CandyEntity[] = [];

	const pushWithBudget = (position: Vector2) => {
		if (remainingOrbs <= 0) return false;
		const size = sampleCandySize(remainingOrbs);
		candies.push(
			createCandy({
				position,
				type: CandyType.Loot,
				size,
			}),
		);
		remainingOrbs -= size;
		return remainingOrbs > 0;
	};

	if (hasPolygon) {
		print(`Soldier ${soldier.id} has polygon, dropping candy`);
		// Determine total candy count to drop (density based on orbs)
		const desired = math.clamp(math.ceil(math.log10(soldier.orbs + 1) * 25), 3, 200);

		// 1) Place candies on vertices first
		const vertexCount = polygon.size();
		for (let i = 0; i < math.min(desired, vertexCount); i++) {
			if (!pushWithBudget(polygon[i])) break;
		}

		// 2) If candies remain, distribute equally across edges
		const remaining = math.max(0, desired - candies.size());
		if (remaining > 0) {
			const edges: Array<{ a: Vector2; b: Vector2 }> = [];
			for (let i = 0; i < vertexCount; i++) {
				const a = polygon[i];
				const b = polygon[(i + 1) % vertexCount];
				edges.push({ a, b });
			}

			const basePerEdge = math.floor(remaining / edges.size());
			const extra = remaining % edges.size();

			for (let e = 0; e < edges.size(); e++) {
				const edge = edges[e];
				const countOnEdge = basePerEdge + (e < extra ? 1 : 0);
				if (countOnEdge <= 0) continue;

				// Evenly spaced along the segment, avoiding exact vertices
				for (let i = 1; i <= countOnEdge; i++) {
					if (remainingOrbs <= 0) break;
					const t = i / (countOnEdge + 1);
					const pos = edge.a.add(edge.b.sub(edge.a).mul(t));
					if (!pushWithBudget(pos)) break;
				}
			}
		}
	} else {
		warn("Soldier has no polygon, dropping candy at base radius");
		const radius = SOLDIER_RADIUS_BASE;
		const fallbackCount = 20;
		for (const _ of $range(1, fallbackCount)) {
			const x = random.NextNumber(-1, 1) * radius;
			const y = random.NextNumber(-1, 1) * radius;
			if (!pushWithBudget(soldier.position.add(new Vector2(x, y)))) break;
		}
	}
	store.populateCandy(candies);
}

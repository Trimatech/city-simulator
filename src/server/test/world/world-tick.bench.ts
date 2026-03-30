import { store } from "server/store";
import {
	CANDY_LIMITS,
	candyGrid,
	createCandy,
	getSafePointInWorld,
	initCandyService,
	initCollisionService,
	initSoldierService,
	onCandyTick,
	onCollisionTick,
	onSoldierTick,
	soldierGrid,
} from "server/world";
import { WORLD_BOUNDS } from "shared/constants/core";
import { CandyType } from "shared/store/candy-grid/candy-types";
import { benchmark } from "shared/utils/benchmark";
import { fillArray } from "shared/utils/object-utils";
import { disconnectAllSchedulers } from "shared/utils/scheduler";

export = benchmark({
	functions: {
		onSoldierTick: () => onSoldierTick(1 / 60),
		onCandyTick,
		onCollisionTick,
		getSafePointInWorld,
	},
});

async function setup() {
	// Clear the store and grids
	store.destroy();
	store.resetState();
	candyGrid.clear();
	soldierGrid.clear();

	// Generate 50 soldiers of varying lengths
	for (const index of $range(0, 50)) {
		const x = (index * 4) % WORLD_BOUNDS;
		const y = math.floor(index / 4) * 4;
		const position = new Vector2(x, y);

		store.addSoldier(`Soldier ${index}`, {
			position,
			orbs: 1000 + 160 * index,
			desiredAngle: 0.5 * index,
		});
	}

	// Generate the maximum number of candies
	const candies = fillArray(CANDY_LIMITS[CandyType.Default], () => createCandy());
	// add to grid state via candy-utils populate path
	// Note: populateCandy(amount) also updates replicated grid; here we already created entities
	for (const c of candies) {
		// mimic addCandyEntity without import to keep bench isolated
		const x = math.floor(c.position.X / candyGrid.resolution);
		const y = math.floor(c.position.Y / candyGrid.resolution);
		const key = `${x},${y}`;
		const cells = store.getState().candyGrid.cells;
		const current = { ...(cells[key] ?? {}) } as { [id: string]: typeof c | undefined };
		current[c.id] = c;
		store.setCandyCell(key, current);
	}

	// Initialize core services
	initCandyService();
	initSoldierService();
	initCollisionService();

	disconnectAllSchedulers();
}

setup();

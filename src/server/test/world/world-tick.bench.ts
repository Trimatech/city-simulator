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
import { CandyType } from "shared/store/candy";
import { benchmark } from "shared/utils/benchmark";
import { fillArray } from "shared/utils/object-utils";
import { disconnectAllSchedulers } from "shared/utils/scheduler";

export = benchmark({
	functions: {
		onSoldierTick,
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
	store.populateCandy(fillArray(CANDY_LIMITS[CandyType.Default], () => createCandy()));

	// Initialize core services
	initCandyService();
	initSoldierService();
	initCollisionService();

	disconnectAllSchedulers();
}

setup();

import { WORLD_TICK } from "shared/constants/core";
import { createScheduler } from "shared/utils/scheduler";

import { onTowerTick } from "./tower-tick";

const TOWER_TICK_PHASE = 4; // Adjust this based on your needs

export async function initTowerService() {
	createScheduler({
		name: "towers",
		tick: WORLD_TICK,
		phase: TOWER_TICK_PHASE,
		onTick: onTowerTick,
	});

	// Towers are cleaned up in killSoldier() when the player is fully eliminated.
	// We intentionally do NOT remove towers on death, because the player may revive.
}

import { store } from "server/store";
import { WORLD_TICK } from "shared/constants/core";
import { identifySoldier, selectAliveSoldiersById } from "shared/store/soldiers";
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

	// Clean up towers when their owner dies
	store.observe(selectAliveSoldiersById, identifySoldier, ({ id }) => {
		return () => {
			store.removeTowersByOwnerId(id);
		};
	});
}

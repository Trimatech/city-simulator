import { SIM_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { createScheduler } from "shared/utils/scheduler";
import { Players } from "@rbxts/services";
import { store } from "server/store";

import { getAllCities } from "./city-manager";
import { initCityManager } from "./city-manager";

// Initialize the city manager (handles player join/leave, tool placement)
initCityManager();

// ── Simulation tick loop ────────────────────────────────────────────
createScheduler({
	name: "SimEngine",
	tick: SIM_TICK,
	onTick: () => {
		const cities = getAllCities();

		cities.forEach((ctx, userId) => {
			if (ctx.speed === 0) return; // paused

			const player = Players.GetPlayerByUserId(userId);
			if (!player) return;

			// Advance simulation tick counter
			ctx.simTick += ctx.speed;

			// TODO Phase 3: Run simulation modules here
			// - Power grid recalculation (if dirty)
			// - Zone evaluation (incremental, ~750 tiles per tick)
			// - Census updates
			// - Population/demand recalculation

			// TODO Phase 4: Budget calculations at year boundary

			// Flush dirty tiles and send deltas to client
			if (ctx.tileMap.isDirty()) {
				const deltas = ctx.tileMap.flushDirty();
				remotes.city.applyDeltas.fire(player, deltas);
			}
		});
	},
});

import { Players } from "@rbxts/services";
import { store } from "server/store";
import { SOLDIER_TICK_PHASE } from "server/world/constants";
import { killSoldier, playerIsSpawned } from "server/world/utils";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { defaultPlayerSave, RANDOM_SKIN, selectPlayerSave } from "shared/store/saves";
import { createScheduler } from "shared/utils/scheduler";

import { deleteSoldierInput, onSoldierTick, registerSoldierInput } from "./soldier-tick";

export async function initSoldierservice() {
	createScheduler({
		name: "soldier",
		tick: WORLD_TICK,
		phase: SOLDIER_TICK_PHASE,
		onTick: onSoldierTick,
	});

	remotes.soldier.spawn.connect((player) => {
		if (playerIsSpawned(player)) {
			return;
		}

		const save = store.getState(selectPlayerSave(player.Name)) || defaultPlayerSave;

		// random skin starts at one because zero is reserved
		const randomSkin = save.skins[math.random(1, save.skins.size() - 1)];
		const currentSkin = save.skin;

		const position = player.Character?.PrimaryPart?.Position;

		print("Spawn soldier for", player.Name, position);

		store.addSoldier(player.Name, {
			name: player.DisplayName,
			position: position ? new Vector2(position.X, position.Y) : undefined,
			skin: currentSkin !== RANDOM_SKIN ? currentSkin : randomSkin,
			score: 10,
		});
	});

	remotes.soldier.move.connect((player, position) => {
		registerSoldierInput(player.Name, position);
	});

	remotes.soldier.boost.connect((player, boost) => {
		store.boostSoldier(player.Name, boost);
	});

	remotes.soldier.kill.connect((player) => {
		killSoldier(player.Name);
	});

	Players.PlayerRemoving.Connect((player) => {
		deleteSoldierInput(player.Name);
		killSoldier(player.Name);
	});
}

import { Players } from "@rbxts/services";
import { store } from "server/store";
import { SOLDIER_TICK_PHASE } from "server/world/constants";
import { getSafePointInWorld, killSoldier, playerIsSpawned } from "server/world/utils";
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
			warn("Player already spawned");
			return;
		}

		const save = store.getState(selectPlayerSave(player.Name)) || defaultPlayerSave;

		// random skin starts at one because zero is reserved
		const randomSkin = save.skins[math.random(1, save.skins.size() - 1)];
		const currentSkin = save.skin;

		const safePoint = getSafePointInWorld();

		const character = player.Character;
		if (character) {
			const primaryPart = character.PrimaryPart;
			if (primaryPart) {
				primaryPart.CFrame = new CFrame(safePoint.X, 10, safePoint.Y);
			} else {
				error(`No PrimaryPart found for player ${player.Name}`);
			}
		} else {
			error(`No character found for player ${player.Name}`);
		}
		print("Spawn soldier for", player.Name, safePoint);
		store.addSoldier(player.Name, {
			name: player.DisplayName,
			position: safePoint ? new Vector2(safePoint.X, safePoint.Y) : undefined,
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

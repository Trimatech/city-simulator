import { Players } from "@rbxts/services";
import { waitForPrimaryPart } from "@rbxts/wait-for";
import { store } from "server/store";
import { SOLDIER_TICK_PHASE } from "server/world/constants";
import { getSafePointInWorld, killSoldier, playerIsSpawned } from "server/world/utils";
import { WORLD_TICK } from "shared/constants/core";
import {
	calculatePolygonOperation,
	pointsToVectors,
	setIntersectionPoints,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { calculatePolygonArea } from "shared/polygon-extra.utils";
import { remotes } from "shared/remotes";
import { defaultPlayerSave, RANDOM_SKIN, selectPlayerSave } from "shared/store/saves";
import { selectIsInsideBySoldierById } from "shared/store/soldiers";
import { identifySoldier } from "shared/store/soldiers";
import { createScheduler } from "shared/utils/scheduler";

import { deleteSoldierInput, onSoldierTick, registerSoldierInput } from "./soldier-tick";

export async function initSoldierService() {
	createScheduler({
		name: "soldier",
		tick: WORLD_TICK,
		phase: SOLDIER_TICK_PHASE,
		onTick: onSoldierTick,
	});

	remotes.soldier.spawn.connect(async (player) => {
		if (playerIsSpawned(player)) {
			warn("Player already spawned");
			return;
		}

		print("Spawn soldier for", player.Name);
		const save = store.getState(selectPlayerSave(player.Name)) || defaultPlayerSave;

		// random skin starts at one because zero is reserved
		const randomSkin = save.skins[math.random(1, save.skins.size() - 1)];
		const currentSkin = save.skin;

		const safePoint = getSafePointInWorld();

		if (
			!player.Character ||
			!player.Character.FindFirstChild("Humanoid") ||
			(player.Character.FindFirstChild("Humanoid") as Humanoid).Health <= 0
		) {
			warn(`Cannot spawn soldier for ${player.Name} because the player is dead`);
			player.CharacterAdded.Wait();
		}

		const character = player.Character as Model;
		const primaryPart = await waitForPrimaryPart(character);

		if (primaryPart) {
			print("PrimaryPart found for", player.Name);
			primaryPart.CFrame = new CFrame(safePoint.X, 10, safePoint.Y);
			print("Spawn soldier to point", player.Name, safePoint);
			store.addSoldier(player.Name, {
				name: player.DisplayName,
				position: safePoint ? new Vector2(safePoint.X, safePoint.Y) : undefined,
				skin: currentSkin !== RANDOM_SKIN ? currentSkin : randomSkin,
				score: 10,
			});
		} else {
			warn(`No PrimaryPart found for player ${player.Name}`);
		}
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

	store.observe(selectIsInsideBySoldierById, identifySoldier, ({ id, polygon, tracers, position }) => {
		const resultPolygon = pointsToPolygon(vectorsToPoints(polygon as Vector2[]));
		const points = vectorsToPoints(tracers as Vector2[]);
		const newCutPolygon = setIntersectionPoints(resultPolygon, points);

		if (newCutPolygon) {
			const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");

			if (result.regions.size() > 0 && result.regions[0].size() > 2) {
				const resultPolygon = pointsToVectors(result.regions[0] as Point[]);
				const polygonAreaSize = calculatePolygonArea(resultPolygon);
				// return { ...soldier, isInside, polygon: resultPolygon, polygonAreaSize, tracers: [] };

				store.setSoldierPolygon(id, resultPolygon, polygonAreaSize);
			} else {
				warn("No valid REGIONS found", { result, points, newCutPolygon });
			}
		} else {
			warn("No INTERSECTION found", { points, newCutPolygon });
		}

		store.clearSoldierTracers(id);

		// when the soldier dies, create candy on the soldier's tracers
		return () => {
			warn(`Soldier ${id} is no longer inside--------------------`);
			//	store.setSoldierTracers(id, [position]);
		};
	});
}

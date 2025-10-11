import Object from "@rbxts/object-utils";
import { Players } from "@rbxts/services";
import { waitForPrimaryPart } from "@rbxts/wait-for";
import { store } from "server/store";
import { DEFAULT_ORBS, SOLDIER_TICK_PHASE } from "server/world/constants";
import { getCandy, getSafePointInWorld, killSoldier, playerIsSpawned } from "server/world/world.utils";
import { SOLDIER_BOOST_SPEED, SOLDIER_MIN_AREA, SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import {
	calculatePolygonBoundingBox,
	calculatePolygonOperation,
	isPointInPolygon,
	pointsToVectors,
	setIntersectionPoints,
	vector2ToPoint,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { calculatePolygonArea } from "shared/polygon-extra.utils";
import { remotes } from "shared/remotes";
import { defaultPlayerSave, RANDOM_SKIN, selectPlayerSave } from "shared/store/saves";
import {
	identifySoldier,
	selectAliveSoldiersById,
	selectIsInsideBySoldierById,
	selectSoldierIsBoosting,
	selectSoldiersById,
} from "shared/store/soldiers";
import { createScheduler } from "shared/utils/scheduler";

import { candyGrid, eatCandies } from "../candy/candy-utils";
import { deleteSoldierInput, onSoldierTick, registerSoldierInput } from "./soldier-tick";
import { placeTower } from "./soldiers.placeTower";
import { setSoldierSpeed } from "./soldiers.utils";

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
			character.PivotTo(new CFrame(safePoint.X, 10, safePoint.Y));
			print("Move soldier to point", player.Name, safePoint);
			store.addSoldier(player.Name, {
				name: player.DisplayName,
				lastPosition: undefined,
				position: safePoint ? new Vector2(safePoint.X, safePoint.Y) : undefined,
				skin: currentSkin !== RANDOM_SKIN ? currentSkin : randomSkin,
				orbs: DEFAULT_ORBS,
			});
		} else {
			warn(`No PrimaryPart found for player ${player.Name}`);
		}
	});

	remotes.soldier.move.connect((player, position) => {
		registerSoldierInput(player.Name, position);
	});

	remotes.soldier.placeTower.connect((player, position) => {
		placeTower(player, position);
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

	// TODO: should only check if spawned

	store.observe(selectIsInsideBySoldierById, identifySoldier, ({ id, polygon, tracers }) => {
		const resultPolygon = pointsToPolygon(vectorsToPoints(polygon as Vector2[]));
		const points = vectorsToPoints(tracers as Vector2[]);
		const newCutPolygon = setIntersectionPoints(resultPolygon, points);

		if (newCutPolygon) {
			print(`newCutPolygon ${id}`, tracers);
			const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");

			if (result.regions.size() > 0 && result.regions[0].size() > 2) {
				const resultPolygon = pointsToVectors(result.regions[0] as Point[]);
				const polygonAreaSize = calculatePolygonArea(resultPolygon);

				store.setSoldierPolygon(id, resultPolygon, polygonAreaSize, true);

				// Calculate bounding box for the new cut polygon
				const newCutPoints = newCutPolygon.regions[0] as Point[];
				const boundingBox = calculatePolygonBoundingBox(newCutPoints);

				// Eat all candies inside the newly claimed area
				const candiesInNewArea = candyGrid.queryBox(boundingBox.min, boundingBox.size, (point) => {
					const candy = getCandy(point.metadata.id);
					if (!candy || candy.eatenAt) return false;

					return isPointInPolygon(vector2ToPoint(point.position), newCutPoints);
				});

				eatCandies(candiesInNewArea, id);

				const state = store.getState();
				const allSoldiers = Object.values(selectSoldiersById(state));

				allSoldiers.forEach((soldier) => {
					const soldierId = soldier.id;
					if (soldierId !== id && soldier.polygon) {
						const otherSoldierPolygon = pointsToPolygon(vectorsToPoints(soldier.polygon));
						const differenceResult = calculatePolygonOperation(
							otherSoldierPolygon,
							newCutPolygon,
							"Difference",
						);

						if (differenceResult.regions.size() > 0 && differenceResult.regions[0].size() > 2) {
							const updatedPolygon = pointsToVectors(differenceResult.regions[0] as Point[]);
							const updatedArea = calculatePolygonArea(updatedPolygon);
							store.setSoldierPolygon(soldierId, updatedPolygon, updatedArea);

							if (updatedArea < SOLDIER_MIN_AREA) {
								print(`Soldier ${soldierId} is too small, killing`);
								killSoldier(soldierId);
								store.playerKilledSoldier(id, soldierId);
								store.incrementSoldierEliminations(soldierId);
							}
						}
					}
				});
			} else {
				warn("No valid REGIONS found", { result, points, newCutPolygon });
			}
		} else {
			warn("No INTERSECTION found", { points, newCutPolygon });
		}

		store.clearSoldierTracers(id);

		return () => {
			print(`Soldier ${id} is no longer inside--------------------`);
		};
	});

	store.observe(selectAliveSoldiersById, identifySoldier, ({ id }) => {
		print(`Soldier ${id} is alive in saga`);
		setSoldierSpeed(id, SOLDIER_SPEED);
		const disconnect = store.observeWhile(selectSoldierIsBoosting(id), () => {
			print(`Soldier ${id} is boosting in saga`);
			setSoldierSpeed(id, SOLDIER_BOOST_SPEED);
			return () => {
				print(`Soldier ${id} is no longer boosting in saga`);
				setSoldierSpeed(id, SOLDIER_SPEED);
			};
		});

		// when the soldier dies, create candy on the soldier's tracers
		return () => {
			disconnect();
			setSoldierSpeed(id, SOLDIER_SPEED);
			// HERE WE DIE AND DROP STUFF
			print(`Soldier ${id} died in saga`);
		};
	});
}

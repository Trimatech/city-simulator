import { Players } from "@rbxts/services";
import { store } from "server/store";
import { DEFAULT_ORBS, SOLDIER_TICK_PHASE } from "server/world/constants";
import { getCandy, getSafePointOutsideSoldierPolygons, killSoldier, playerIsSpawned } from "server/world/world.utils";
import { SOLDIER_MIN_AREA, SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import {
	aabbIntersects,
	calculatePolygonBoundingBox,
	calculatePolygonOperation,
	isPointInPolygon,
	pointsToVectors,
	selectLargestRegionByArea,
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
	selectSoldiersById,
} from "shared/store/soldiers";
// grid-lines utils imported in soldier-grid helpers
import { findCharacterPrimaryPart, reloadCharacterAsync } from "shared/utils/player-utils";
import { createScheduler } from "shared/utils/scheduler";

import { candyGrid, eatCandies } from "../candy/candy-utils";
import { clearOwnerTracersFromGrid, updateAreaGridForPolygon } from "./soldier-grid";
import { deleteSoldierInput, onSoldierTick, registerSoldierInput } from "./soldier-tick";
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

		const safePoint = getSafePointOutsideSoldierPolygons();

		await reloadCharacterAsync(player);

		print("Character loaded, adding soldier");
		// Add soldier to state now that character is present
		store.addSoldier(player.Name, {
			name: player.DisplayName,
			lastPosition: undefined,
			position: safePoint ? new Vector2(safePoint.X, safePoint.Y) : undefined,
			skin: currentSkin !== RANDOM_SKIN ? currentSkin : randomSkin,
			orbs: DEFAULT_ORBS,
			health: 100,
			maxHealth: 100,
		});

		// Initialize grid cells for the initial polygon right after spawn
		{
			const state = store.getState();
			const soldier = selectSoldiersById(state)[player.Name];
			const polygon = soldier?.polygon as Vector2[] | undefined;
			if (polygon && polygon.size() > 0) {
				updateAreaGridForPolygon({ ownerId: player.Name, polygon });
			}
		}

		const character = player.Character as Model;

		const primaryPart = findCharacterPrimaryPart(character);

		if (primaryPart) {
			print("PrimaryPart found for", player.Name);
			// Move character to spawn
			character.PivotTo(new CFrame(safePoint.X, 100, safePoint.Y));
			print("Move soldier to point", player.Name, safePoint);
		} else {
			warn(`No PrimaryPart found for player ${player.Name}`);
		}
	});

	remotes.soldier.move.connect((player, position) => {
		registerSoldierInput(player.Name, position);
	});

	remotes.soldier.kill.connect((player) => {
		killSoldier(player.Name);
	});

	Players.PlayerRemoving.Connect((player) => {
		deleteSoldierInput(player.Name);
		killSoldier(player.Name);
	});

	// TODO: should only check if spawned

	store.observe(selectIsInsideBySoldierById, identifySoldier, ({ id, polygon, tracers, isInside }) => {
		debug.profilebegin("SOLDIER_IS_INSIDE");
		print(`Soldier ${id} is ${isInside ? "inside" : "outside"}--------------------`);

		try {
			const resultPolygon = pointsToPolygon(vectorsToPoints(polygon as Vector2[]));
			const points = vectorsToPoints(tracers as Vector2[]);
			const newCutPolygon = setIntersectionPoints(resultPolygon, points);

			if (newCutPolygon) {
				//	print(`newCutPolygon ${id}`, tracers);
				const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");

				if (result.regions.size() > 0) {
					const bestRegion = selectLargestRegionByArea(result.regions);

					if (bestRegion !== undefined) {
						const resultPolygon = pointsToVectors(bestRegion);
						const polygonAreaSize = calculatePolygonArea(resultPolygon);

						store.setSoldierPolygon(id, resultPolygon, polygonAreaSize, true);

						// Build area lines per cell for updated polygon and diff grid
						updateAreaGridForPolygon({ ownerId: id, polygon: resultPolygon as Vector2[] });

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
						const soldiersById = selectSoldiersById(state);
						// AABB prefilter against the newly cut polygon to avoid expensive poly ops
						const newCutBounds = calculatePolygonBoundingBox(newCutPoints);

						for (const [, soldier] of pairs(soldiersById)) {
							const soldierId = soldier.id;
							if (soldierId !== id && soldier.polygon) {
								// Quick reject using cached bounding boxes
								const otherBounds = soldier.polygonBounds;
								if (!aabbIntersects(otherBounds, newCutBounds)) {
									continue;
								}
								const otherSoldierPolygon = pointsToPolygon(vectorsToPoints(soldier.polygon));
								const differenceResult = calculatePolygonOperation(
									otherSoldierPolygon,
									newCutPolygon,
									"Difference",
								);

								if (differenceResult.regions.size() > 0) {
									const bestRegion = selectLargestRegionByArea(differenceResult.regions);
									if (bestRegion !== undefined) {
										const updatedPolygon = pointsToVectors(bestRegion);
										const updatedArea = calculatePolygonArea(updatedPolygon);
										store.setSoldierPolygon(soldierId, updatedPolygon, updatedArea);
										// Reflect the victim's new area in grid without dropping their tracers
										updateAreaGridForPolygon({
											ownerId: soldierId,
											polygon: updatedPolygon as Vector2[],
											dropTracers: false,
										});
										if (updatedArea < SOLDIER_MIN_AREA) {
											print(`Soldier ${soldierId} is too small, killing`);
											killSoldier(soldierId);
											store.playerKilledSoldier(id, soldierId);
											store.incrementSoldierEliminations(id);
										}
									}
								} else {
									// Fully covered: clear victim's area on grid and eliminate
									updateAreaGridForPolygon({
										ownerId: soldierId,
										polygon: [] as Vector2[],
										dropTracers: false,
									});
									store.setSoldierPolygon(soldierId, [], 0, true);
									killSoldier(soldierId);
									store.playerKilledSoldier(id, soldierId);
									store.incrementSoldierEliminations(id);
								}
							}
						}
					}
				} else {
					warn("No valid REGIONS found", { result, points, newCutPolygon });
					// Could not form a valid region; clear tracers and their grid lines to avoid residue
					store.setSoldierTracers(id, []);
					clearOwnerTracersFromGrid(id);
				}
			} else {
				warn("No INTERSECTION found", { points, newCutPolygon });
				// Could not compute intersection; clear tracers and their grid lines
				store.setSoldierTracers(id, []);
				clearOwnerTracersFromGrid(id);
			}
		} catch (err) {
			warn("SOLDIER_IS_INSIDE failed", { id, err });
		} finally {
			// Keep tracers; do not clear here.
			debug.profileend();
		}
		return () => {
			print(`Soldier ${id} is no longer inside--------------------`);
		};
	});

	store.observe(selectAliveSoldiersById, identifySoldier, ({ id }) => {
		print(`Soldier ${id} is alive in saga, setting speed to ${SOLDIER_SPEED}`);
		setSoldierSpeed(id, SOLDIER_SPEED);

		// when the soldier dies, create candy on the soldier's tracers
		return () => {
			setSoldierSpeed(id, SOLDIER_SPEED);
			// HERE WE DIE AND DROP STUFF
			print(`Soldier ${id} died in saga`);
		};
	});
}

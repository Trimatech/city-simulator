import { Players, Workspace } from "@rbxts/services";
import { store } from "server/store";
import { DEFAULT_ORBS, SOLDIER_TICK_PHASE } from "server/world/constants";
import {
	cancelDeathChoiceTimer,
	getPolygonCenterInside,
	getSpawnPointNearAnyPlayer,
	killSoldier,
	onPlayerDeath,
	playerIsSpawned,
} from "server/world/world.utils";
import { REVIVE_CRYSTAL_COST, SOLDIER_SPEED, WORLD_TICK } from "shared/constants/core";
import { setIntersectionPoints, vectorsToPoints } from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { remotes } from "shared/remotes";
import { defaultPlayerSave, RANDOM_SKIN, selectPlayerCrystals, selectPlayerSave } from "shared/store/saves";
import {
	identifySoldier,
	selectAliveSoldiersById,
	selectIsInsideBySoldierById,
	selectSoldierById,
} from "shared/store/soldiers";
// grid-lines utils imported in soldier-grid helpers
import { findCharacterPrimaryPart, reloadCharacterAsync } from "shared/utils/player-utils";
import { createScheduler } from "shared/utils/scheduler";

import { applyInitialPolygonClaim, processNewAreaClaim } from "./soldier-claims";
import { clearOwnerTracersFromGrid } from "./soldier-grid";
import { deleteSoldierInput, onSoldierTick, registerSoldierInput } from "./soldier-tick";
import { applySoldierTerritorySpeed, setSoldierSpeed } from "./soldiers.utils";

// Debounce map to prevent rapid-fire area claims
const lastAreaClaimTime = new Map<string, number>();
const AREA_CLAIM_COOLDOWN_MS = 100; // Cooldown in milliseconds

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

		const safePoint = getSpawnPointNearAnyPlayer();

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
		applyInitialPolygonClaim(player.Name);

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

	remotes.soldier.continue.connect(async (player) => {
		const soldierId = player.Name;
		print(`[Revive] continue received from ${soldierId}`);
		const soldier = store.getState(selectSoldierById(soldierId));
		if (!soldier || !soldier.dead) {
			warn(`[Revive] REJECTED: soldier=${soldier !== undefined}, dead=${soldier?.dead}`);
			return;
		}

		const crystals = store.getState(selectPlayerCrystals(soldierId)) ?? 0;
		if (crystals < REVIVE_CRYSTAL_COST) {
			warn(`[Revive] REJECTED: crystals=${crystals}, need=${REVIVE_CRYSTAL_COST}`);
			return;
		}

		const deadline = soldier.deathChoiceDeadline;
		const now = Workspace.GetServerTimeNow();
		if (deadline === undefined || now > deadline) {
			warn(
				`[Revive] REJECTED: deadline=${deadline}, serverTime=${now}, expired=${deadline !== undefined && now > deadline}`,
			);
			return;
		}

		cancelDeathChoiceTimer(soldierId);

		const center = getPolygonCenterInside(soldierId);
		if (!center) {
			warn(`Cannot revive ${soldierId}: no valid polygon center`);
			killSoldier(soldierId);
			return;
		}

		store.spendPlayerCrystals(soldierId, REVIVE_CRYSTAL_COST);
		store.incrementMilestoneReviveCount(soldierId);
		await reloadCharacterAsync(player);

		const character = player.Character as Model;
		if (character) {
			character.PivotTo(new CFrame(center.X, 100, center.Y));
		}

		store.patchSoldier(soldierId, {
			dead: false,
			position: center,
			health: soldier.maxHealth,
			deathChoiceDeadline: undefined,
		});
	});

	remotes.soldier.startOver.connect((player) => {
		cancelDeathChoiceTimer(player.Name);
		killSoldier(player.Name);
	});

	Players.PlayerRemoving.Connect((player) => {
		deleteSoldierInput(player.Name);
		onPlayerDeath(player.Name, player.Name, "leaving-server");
	});

	// TODO: should only check if spawned

	store.observe(selectIsInsideBySoldierById, identifySoldier, ({ id, polygon, tracers, isInside: _isInside }) => {
		debug.profilebegin("SOLDIER_IS_INSIDE");
		//print(`Soldier ${id} is ${isInside ? "inside" : "outside"}--------------------`);

		// Early exit: Check minimum tracer requirement
		if (tracers.size() < 2) {
			print(`Soldier ${id} has less than 2 tracers, skipping`);
			debug.profileend();
			return;
		}

		// Early exit: Debounce rapid area claims to prevent performance spikes
		const now = os.clock() * 1000;
		const lastClaim = lastAreaClaimTime.get(id);
		if (lastClaim !== undefined && now - lastClaim < AREA_CLAIM_COOLDOWN_MS) {
			print(`Soldier ${id} area claim on cooldown, skipping`);
			debug.profileend();
			return;
		}
		lastAreaClaimTime.set(id, now);

		// Early exit: Check if polygon exists and has enough points
		if (!polygon || polygon.size() < 3) {
			print(`Soldier ${id} has invalid polygon, skipping`);
			debug.profileend();
			return;
		}

		try {
			const resultPolygon = pointsToPolygon(vectorsToPoints(polygon));
			const points = vectorsToPoints(tracers);
			const newCutPolygon = setIntersectionPoints(resultPolygon, points);

			if (newCutPolygon) {
				processNewAreaClaim(id, newCutPolygon);
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
			//print(`Soldier ${id} is no longer inside--------------------`);
			// Clean up debounce entry when soldier is no longer inside
			lastAreaClaimTime.delete(id);
		};
	});

	store.observe(selectAliveSoldiersById, identifySoldier, ({ id }) => {
		// Spawn inside own territory → 2x speed
		applySoldierTerritorySpeed(id, true, false);

		// when the soldier dies, reset speed
		return () => {
			setSoldierSpeed(id, SOLDIER_SPEED);
			print(`Soldier ${id} died in saga`);
		};
	});
}

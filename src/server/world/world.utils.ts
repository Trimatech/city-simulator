import { Falldown } from "@rbxts/falldown";
import { Players, Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { handleElimination } from "server/rewards/services/social-feed";
import { store } from "server/store";
import { dropCandyAlongPath, dropCandyOnDeath } from "server/world/services/candy/candy-utils";
import { clearOwnerFromGrid, clearOwnerTracersFromGrid } from "server/world/services/soldiers/soldier-grid";
import { getRandomPointInWorld, getSoldier } from "server/world/world-query.utils";
import {
	DEATH_CHOICE_TIMEOUT_SEC,
	INITIAL_POLYGON_DIAMETER,
	INITIAL_POLYGON_ITEMS,
	IS_LOCAL,
	WORLD_BOUNDS,
} from "shared/constants/core";
import { calculatePolygonOperation, isPointInPolygon, vector2ToPoint } from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { createPolygonAroundPosition, getPolygonCentroid } from "shared/polygon-extra.utils";
import { KillSource } from "shared/store/milestones/milestone-utils";
import { selectAliveSoldiersById } from "shared/store/soldiers";
import { RAGDOLL_DURATION_SEC } from "shared/utils/ragdoll";

import { getBotHumanoid } from "./services/bots/bot-registry";
import { getCandy as getCandyLocal } from "./services/candy/candy-store";
import { getEdgeSpawnPosition, getRandomEmptyCellPosition } from "./services/soldiers/occupied-cells";

const MIN_SPAWN_SPACING = 35;
const SAFE_SPAWN_ATTEMPTS = 40;

const RANDOM_POINT_MARGIN = 0.8;

function getNearestAliveSoldierDistance(point: Vector2): number {
	const aliveById = store.getState(selectAliveSoldiersById);
	let nearest = math.huge;
	for (const [, soldier] of pairs(aliveById)) {
		if ((soldier as { dead?: boolean }).dead) continue;
		const pos = (soldier as { position?: Vector2 }).position;
		if (!pos) continue;
		const d = pos.sub(point).Magnitude;
		if (d < nearest) nearest = d;
	}
	return nearest;
}

export { getRandomPointInWorld, getSoldier } from "server/world/world-query.utils";

export function getCandy(candyId: string) {
	return getCandyLocal(candyId);
}

export function getPlayerHumanoidByName(name: string) {
	const isBot = string.sub(name, 1, 4) === "BOT_";

	const player = Players.GetPlayers().find((player) => player.Name === name);
	if (player) {
		const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
		if (humanoid) {
			return humanoid;
		} else {
			warn(`No humanoid found for player ${name}`);
		}
	} else {
		// Check if this name belongs to a registered bot
		const botHumanoid = getBotHumanoid(name);
		if (botHumanoid) {
			return botHumanoid;
		}
		// Bots are rendered client-side only and don't have server-side characters,
		// so a missing humanoid is expected — only warn for real players
		if (!isBot) {
			warn(`No player found for name ${name}`);
		}
	}
	return undefined;
}

export function ensureForceFieldOnHumanoid(humanoid: Humanoid, visible = true) {
	const character = humanoid.Parent as Model | undefined;
	if (!character) return;
	let ff = character.FindFirstChildOfClass("ForceField");
	if (!ff) {
		ff = new Instance("ForceField");
		ff.Visible = visible;
		ff.Parent = character;
	}
	return ff;
}

export function removeForceFieldFromHumanoid(humanoid: Humanoid) {
	const character = humanoid.Parent as Model | undefined;
	if (!character) return;
	const ff = character.FindFirstChildOfClass("ForceField");
	if (ff) ff.Destroy();
}

export function ensureForceFieldOnPlayerName(playerName: string, visible = true) {
	const humanoid = getPlayerHumanoidByName(playerName);
	if (humanoid) return ensureForceFieldOnHumanoid(humanoid, visible);
}

export function removeForceFieldFromPlayerName(playerName: string) {
	const humanoid = getPlayerHumanoidByName(playerName);
	if (humanoid) removeForceFieldFromHumanoid(humanoid);
}

const deathChoiceTimers = new Map<string, thread>();

export function cancelDeathChoiceTimer(soldierId: string) {
	const timer = deathChoiceTimers.get(soldierId);
	if (timer) {
		task.cancel(timer);
		deathChoiceTimers.delete(soldierId);
	}
}

export function onPlayerDeath(soldierId: string, killerId: string, killSource: KillSource) {
	const existing = getSoldier(soldierId);
	if (!existing || existing.dead) {
		print(`[Death] onPlayerDeath(${soldierId}) skipped: exists=${existing !== undefined}, dead=${existing?.dead}`);
		return;
	}

	print(`[Death] onPlayerDeath(${soldierId}) — setting dead=true`);
	store.setSoldierIsDead(soldierId);

	print(
		`[Death] onPlayerDeath(${soldierId}) — calling playerKilledSoldier(killer=${killerId}, victim=${soldierId}, source=${killSource})`,
	);
	store.playerKilledSoldier(killerId, soldierId, killSource);
	handleElimination(killerId, soldierId, killSource);

	const player = Players.FindFirstChild(soldierId);
	if (player?.IsA("Player") && player.Character) {
		const character = player.Character;
		const ragdoll = Falldown.RagdollCharacter(character, 0);
		if (ragdoll) {
			ragdoll.AddRandomVelocity(50);
		}
		task.delay(RAGDOLL_DURATION_SEC, () => {
			ragdoll?.Destroy(Falldown.ExitMode.Immediate);
			task.wait(0.1);
			if (character.Parent) {
				character.Destroy();
			}
		});
	}

	// Drop small orbs along tracers immediately (10% of orbs)
	const soldierTracers = existing.tracers;
	if (soldierTracers.size() >= 2) {
		const tracerOrbs = math.ceil(math.max(0, existing.orbs) * 0.1);
		if (tracerOrbs > 0) {
			dropCandyAlongPath(soldierTracers, tracerOrbs);
			store.decrementSoldierOrbs(soldierId, tracerOrbs);
		}
	}

	store.clearSoldierTracers(soldierId);
	clearOwnerTracersFromGrid(soldierId);

	const deadline = Workspace.GetServerTimeNow() + DEATH_CHOICE_TIMEOUT_SEC;
	print(
		`[Death] onPlayerDeath(${soldierId}) — setting deathChoiceDeadline=${deadline} (serverTime=${Workspace.GetServerTimeNow()})`,
	);
	store.setSoldierDeathChoiceDeadline(soldierId, deadline);

	// Verify the state was actually set
	const verify = getSoldier(soldierId);
	print(`[Death] onPlayerDeath(${soldierId}) — verify: dead=${verify?.dead}, deadline=${verify?.deathChoiceDeadline}`);

	const timer = task.delay(DEATH_CHOICE_TIMEOUT_SEC, () => {
		deathChoiceTimers.delete(soldierId);
		try {
		const soldier = getSoldier(soldierId);
		print(
			`[Death] deathChoiceTimer expired for ${soldierId} — exists=${soldier !== undefined}, dead=${soldier?.dead}`,
		);
		if (soldier?.dead) {
			killSoldier(soldierId);
		}
		} catch (err) {
			warn(`[Death] deathChoiceTimer callback failed for ${soldierId}:`, err);
		}
	});
	deathChoiceTimers.set(soldierId, timer);
}

export function getPolygonCenterInside(soldierId: string): Vector2 | undefined {
	const soldier = getSoldier(soldierId);
	if (!soldier) return undefined;

	const polygon = soldier.polygon as ReadonlyArray<Vector2>;
	if (!polygon || polygon.size() < 3) return undefined;

	const centroid = getPolygonCentroid(polygon);
	if (!centroid) return undefined;

	const testPoint = vector2ToPoint(centroid);
	const polygonPoints = polygon.map(vector2ToPoint);
	if (isPointInPolygon(testPoint, polygonPoints as unknown as [number, number][])) {
		return centroid;
	}

	return polygon[0];
}

export function killSoldier(soldierId: string) {
	print(`[Death] killSoldier(${soldierId}) called`);
	cancelDeathChoiceTimer(soldierId);
	store.setSoldierIsDead(soldierId);

	try {
	const humanoid = getPlayerHumanoidByName(soldierId);
	if (humanoid) {
		// Remove any active ForceField to ensure death goes through
		removeForceFieldFromHumanoid(humanoid);
		// Force kill regardless of damage immunity
		humanoid.Health = 0;
		humanoid.TakeDamage(1000000);
	}
	} catch (err) {
		warn(`[Death] killSoldier humanoid cleanup failed for ${soldierId}:`, err);
	}

	store.removeTowersByOwnerId(soldierId);

	// Clear all grid lines owned by this soldier
	clearOwnerFromGrid(soldierId);

	dropCandyOnDeath(soldierId);

	// Clear polygon so stale snapshots in cutOthersByNewArea can't re-add walls
	store.setSoldierPolygon(soldierId, [], 0, true);

	setTimeout(() => {
		store.removeSoldier(soldierId);
	}, 2);
}

export function takeDamageByPlayerName(playerName: string, amount: number) {
	const humanoid = getPlayerHumanoidByName(playerName);
	if (humanoid) {
		humanoid.TakeDamage(amount);
	}
}

export function playerIsSpawned(player: Player) {
	return getSoldier(player.Name) !== undefined;
}

/**
 * Returns a safe point in the world. Enforces a minimum spacing from existing
 * alive soldiers using store-based positions to prevent initial clustering.
 */
export function getSafePointInWorld() {
	let best: { position: Vector2; safety: number } | undefined;
	for (const _ of $range(1, SAFE_SPAWN_ATTEMPTS)) {
		const position = getRandomPointInWorld(RANDOM_POINT_MARGIN);
		const safety = getNearestAliveSoldierDistance(position);
		if (!best || safety > best.safety) best = { position, safety };
		if (safety >= MIN_SPAWN_SPACING) {
			return position;
		}
	}
	return best ? best.position : getRandomPointInWorld(RANDOM_POINT_MARGIN);
}

/**
 * Returns true if a point lies within any alive soldier's polygon
 */
function isInsideAnySoldierPolygon(point: Vector2): boolean {
	const aliveById = store.getState(selectAliveSoldiersById);
	const testPoint = vector2ToPoint(point);

	for (const [, soldier] of pairs(aliveById)) {
		const polygon = soldier.polygon as ReadonlyArray<Vector2> | undefined;
		if (!polygon || polygon.size() < 3) continue;

		const polygonPoints = polygon.map(vector2ToPoint);
		if (isPointInPolygon(testPoint, polygonPoints as unknown as [number, number][])) {
			return true;
		}
	}

	return false;
}

/**
 * Returns true if the default spawn polygon around a point intersects any alive soldier polygon
 */
function intersectsAnySoldierPolygon(point: Vector2): boolean {
	const aliveById = store.getState(selectAliveSoldiersById);
	const newPolygonPoints = createPolygonAroundPosition(point, INITIAL_POLYGON_DIAMETER, INITIAL_POLYGON_ITEMS);
	const newPolygon = pointsToPolygon(newPolygonPoints.map(vector2ToPoint));

	for (const [, soldier] of pairs(aliveById)) {
		const polygon = soldier.polygon as ReadonlyArray<Vector2> | undefined;
		if (!polygon || polygon.size() < 3) continue;
		const otherPolygon = pointsToPolygon(polygon.map(vector2ToPoint));
		let intersect;
		try {
			intersect = calculatePolygonOperation(newPolygon, otherPolygon, "Intersect");
		} catch (err) {
			warn("getSafePointOutsideSoldierPolygons: intersect failed", err);
			continue;
		}
		if (intersect.regions.size() > 0) return true;
	}

	return false;
}

/**
 * Returns a safe point for bots that is also outside all other soldiers' polygons.
 * Uses grid-based empty cell lookup first for efficiency, then falls back to
 * random sampling, and finally to territory edge spawning.
 */
export function getSafePointOutsideSoldierPolygons(maxTries = 25) {
	// Fast path: pick from grid-based empty cells (computed on-demand, prefers near players)
	const emptyPos = getRandomEmptyCellPosition();
	if (emptyPos && !intersectsAnySoldierPolygon(emptyPos)) {
		return emptyPos;
	}

	for (const _ of $range(1, maxTries)) {
		const candidate = getSafePointInWorld();
		if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
			return candidate;
		}
	}

	// Fallback: sample near origin until outside polygons is found
	for (const _ of $range(1, maxTries)) {
		const candidate = getRandomPointInWorld(RANDOM_POINT_MARGIN);
		if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
			return candidate;
		}
	}

	// Last resort: spawn at the edge of a soldier's territory
	const edgePos = getEdgeSpawnPosition();
	if (edgePos) return edgePos;

	return getRandomPointInWorld(RANDOM_POINT_MARGIN);
}

/**
 * Get bounding box of a polygon
 */
function getPolygonBoundingBox(polygon: ReadonlyArray<Vector2>): { min: Vector2; max: Vector2 } {
	let minX = math.huge;
	let minY = math.huge;
	let maxX = -math.huge;
	let maxY = -math.huge;

	for (const point of polygon) {
		minX = math.min(minX, point.X);
		minY = math.min(minY, point.Y);
		maxX = math.max(maxX, point.X);
		maxY = math.max(maxY, point.Y);
	}

	return {
		min: new Vector2(minX, minY),
		max: new Vector2(maxX, maxY),
	};
}

const BOT_SPAWN_MIN_DISTANCE = IS_LOCAL ? 60 : 150;
const BOT_SPAWN_MAX_DISTANCE = IS_LOCAL ? 200 : 400;

const PLAYER_SPAWN_MIN_DISTANCE = IS_LOCAL ? 80 : 120;
const PLAYER_SPAWN_MAX_DISTANCE = IS_LOCAL ? 250 : 350;

/**
 * Returns a spawn point near a player's polygon bounding box (60-200 studs away)
 * Ensures the point is within world bounds and doesn't overlap existing polygons
 */
export function getSpawnPointNearPlayer(soldierId: string, maxTries = 25): Vector2 | undefined {
	const soldier = getSoldier(soldierId);
	if (!soldier) return undefined;

	const polygon = soldier.polygon as ReadonlyArray<Vector2> | undefined;
	if (!polygon || polygon.size() < 3) {
		// Fallback to position-based spawn if no polygon
		const center = soldier.position;
		return getSpawnPointNearPosition(center, maxTries);
	}

	const bbox = getPolygonBoundingBox(polygon);
	const bboxCenter = bbox.min.add(bbox.max).div(2);
	const random = new Random();

	for (const _ of $range(1, maxTries)) {
		// Random angle around the bounding box center
		const angle = random.NextNumber(0, math.pi * 2);
		// Random distance between min and max spawn distance
		const distance = random.NextNumber(BOT_SPAWN_MIN_DISTANCE, BOT_SPAWN_MAX_DISTANCE);

		// Calculate spawn point from bounding box edge
		const bboxHalfWidth = (bbox.max.X - bbox.min.X) / 2;
		const bboxHalfHeight = (bbox.max.Y - bbox.min.Y) / 2;

		// Direction vector
		const direction = new Vector2(math.cos(angle), math.sin(angle));

		// Start from the edge of bounding box in that direction, then add distance
		const edgeOffset = new Vector2(direction.X * bboxHalfWidth, direction.Y * bboxHalfHeight);
		const candidate = bboxCenter.add(edgeOffset).add(direction.mul(distance));

		// Check if within world bounds (circular world), with same margin as getSafePointInWorld
		if (candidate.Magnitude > WORLD_BOUNDS * RANDOM_POINT_MARGIN) continue;

		// Check if not inside any soldier polygon and doesn't intersect
		if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
			return candidate;
		}
	}

	// Fallback: use grid-based empty cell lookup
	const emptyPos = getRandomEmptyCellPosition();
	if (emptyPos && !intersectsAnySoldierPolygon(emptyPos)) {
		return emptyPos;
	}

	// Last resort: spawn at territory edge
	return getEdgeSpawnPosition();
}

/**
 * Returns a spawn point near a position (60-200 studs away)
 */
function getSpawnPointNearPosition(center: Vector2, maxTries = 25): Vector2 | undefined {
	const random = new Random();

	for (const _ of $range(1, maxTries)) {
		const angle = random.NextNumber(0, math.pi * 2);
		const distance = random.NextNumber(BOT_SPAWN_MIN_DISTANCE, BOT_SPAWN_MAX_DISTANCE);
		const direction = new Vector2(math.cos(angle), math.sin(angle));
		const candidate = center.add(direction.mul(distance));

		if (candidate.Magnitude > WORLD_BOUNDS * RANDOM_POINT_MARGIN) continue;

		if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
			return candidate;
		}
	}

	// Fallback: use grid-based empty cell lookup
	const emptyPos = getRandomEmptyCellPosition();
	if (emptyPos && !intersectsAnySoldierPolygon(emptyPos)) {
		return emptyPos;
	}

	return getEdgeSpawnPosition();
}

/**
 * Get all alive real players (non-bots)
 */
export function getAliveRealPlayers(): string[] {
	const aliveById = store.getState(selectAliveSoldiersById);
	const ids: string[] = [];
	for (const rawId of pairs(aliveById)) {
		const id = tostring(rawId[0]);
		if (string.sub(id, 1, 4) !== "BOT_") {
			const soldier = rawId[1];
			if (!(soldier as { dead?: boolean }).dead) {
				ids.push(id);
			}
		}
	}
	return ids;
}

/**
 * Returns a spawn point near another real player. If no real players are alive,
 * falls back to spawning near a bot. If neither exists, falls back to
 * getSafePointOutsideSoldierPolygons.
 */
export function getSpawnPointNearAnyPlayer(maxTries = 25): Vector2 {
	const aliveById = store.getState(selectAliveSoldiersById);
	const random = new Random();

	// Collect alive real players and bots separately
	const realPlayerIds: string[] = [];
	const botIds: string[] = [];
	for (const [, soldier] of pairs(aliveById)) {
		if ((soldier as { dead?: boolean }).dead) continue;
		const pos = (soldier as { position?: Vector2 }).position;
		if (!pos) continue;
		if (string.sub(soldier.id, 1, 4) === "BOT_") {
			botIds.push(soldier.id);
		} else {
			realPlayerIds.push(soldier.id);
		}
	}

	// Try spawning near a real player first, then near a bot
	const targetIds = realPlayerIds.size() > 0 ? realPlayerIds : botIds;

	if (targetIds.size() > 0) {
		for (const _ of $range(1, maxTries)) {
			const targetId = targetIds[random.NextInteger(0, targetIds.size() - 1)];
			const target = aliveById[targetId];
			if (!target) continue;

			const polygon = target.polygon as ReadonlyArray<Vector2> | undefined;
			const minDist = PLAYER_SPAWN_MIN_DISTANCE;
			const maxDist = PLAYER_SPAWN_MAX_DISTANCE;

			let candidate: Vector2;

			if (polygon && polygon.size() >= 3) {
				const bbox = getPolygonBoundingBox(polygon);
				const bboxCenter = bbox.min.add(bbox.max).div(2);
				const angle = random.NextNumber(0, math.pi * 2);
				const distance = random.NextNumber(minDist, maxDist);
				const direction = new Vector2(math.cos(angle), math.sin(angle));
				const bboxHalfWidth = (bbox.max.X - bbox.min.X) / 2;
				const bboxHalfHeight = (bbox.max.Y - bbox.min.Y) / 2;
				const edgeOffset = new Vector2(direction.X * bboxHalfWidth, direction.Y * bboxHalfHeight);
				candidate = bboxCenter.add(edgeOffset).add(direction.mul(distance));
			} else {
				const pos = target.position;
				if (!pos) continue;
				const angle = random.NextNumber(0, math.pi * 2);
				const distance = random.NextNumber(minDist, maxDist);
				const direction = new Vector2(math.cos(angle), math.sin(angle));
				candidate = pos.add(direction.mul(distance));
			}

			if (candidate.Magnitude > WORLD_BOUNDS * RANDOM_POINT_MARGIN) continue;
			if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
				return candidate;
			}
		}
	}

	// Fast fallback: try grid-based empty cell
	const emptyPos = getRandomEmptyCellPosition();
	if (emptyPos && !intersectsAnySoldierPolygon(emptyPos)) {
		return emptyPos;
	}

	// Fallback if no valid spot found near players/bots
	return getSafePointOutsideSoldierPolygons();
}

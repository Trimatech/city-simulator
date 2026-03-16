import { Falldown } from "@rbxts/falldown";
import { Players, Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { dropCandyOnDeath } from "server/world/services/candy/candy-utils";
import { clearOwnerFromGrid, clearOwnerTracersFromGrid } from "server/world/services/soldiers/soldier-grid";
import { getRandomPointInWorld, getSoldier } from "server/world/world-query.utils";
import {
	DEATH_CHOICE_TIMEOUT_SEC,
	INITIAL_POLYGON_DIAMETER,
	INITIAL_POLYGON_ITEMS,
	WORLD_BOUNDS,
} from "shared/constants/core";
import { calculatePolygonOperation, isPointInPolygon, vector2ToPoint } from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { createPolygonAroundPosition, getPolygonCentroid } from "shared/polygon-extra.utils";
import { selectAliveSoldiersById } from "shared/store/soldiers";
import { RAGDOLL_DURATION_SEC } from "shared/utils/ragdoll";

import { getBotHumanoid } from "./services/bots/bot-registry";
import { getCandy as getCandyLocal } from "./services/candy/candy-store";

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

export function onPlayerDeath(soldierId: string) {
	const existing = getSoldier(soldierId);
	if (!existing || existing.dead) {
		warn(`[Death] onPlayerDeath(${soldierId}) skipped: exists=${existing !== undefined}, dead=${existing?.dead}`);
		return;
	}

	warn(`[Death] onPlayerDeath(${soldierId}) — setting dead=true`);
	store.setSoldierIsDead(soldierId);

	const player = Players.FindFirstChild(soldierId);
	if (player?.IsA("Player") && player.Character) {
		const character = player.Character;
		const ragdoll = Falldown.RagdollCharacter(character, 0);
		if (ragdoll) {
			ragdoll.AddRandomVelocity(50);
		}
		task.delay(RAGDOLL_DURATION_SEC, () => {
			if (character.Parent) {
				character.Destroy();
			}
		});
	}

	store.clearSoldierTracers(soldierId);
	clearOwnerTracersFromGrid(soldierId);

	const deadline = Workspace.GetServerTimeNow() + DEATH_CHOICE_TIMEOUT_SEC;
	warn(`[Death] onPlayerDeath(${soldierId}) — setting deathChoiceDeadline=${deadline} (serverTime=${Workspace.GetServerTimeNow()})`);
	store.setSoldierDeathChoiceDeadline(soldierId, deadline);

	// Verify the state was actually set
	const verify = getSoldier(soldierId);
	warn(`[Death] onPlayerDeath(${soldierId}) — verify: dead=${verify?.dead}, deadline=${verify?.deathChoiceDeadline}`);

	const timer = task.delay(DEATH_CHOICE_TIMEOUT_SEC, () => {
		deathChoiceTimers.delete(soldierId);
		const soldier = getSoldier(soldierId);
		warn(`[Death] deathChoiceTimer expired for ${soldierId} — exists=${soldier !== undefined}, dead=${soldier?.dead}`);
		if (soldier?.dead) {
			killSoldier(soldierId);
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
	warn(`[Death] killSoldier(${soldierId}) called`);
	cancelDeathChoiceTimer(soldierId);
	store.setSoldierIsDead(soldierId);

	const humanoid = getPlayerHumanoidByName(soldierId);
	if (humanoid) {
		// Remove any active ForceField to ensure death goes through
		removeForceFieldFromHumanoid(humanoid);
		// Force kill regardless of damage immunity
		humanoid.Health = 0;
		humanoid.TakeDamage(1000000);
	}

	store.removeTowersByOwnerId(soldierId);

	// Clear all grid lines owned by this soldier
	clearOwnerFromGrid(soldierId);

	dropCandyOnDeath(soldierId);

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
 * Returns a safe point for bots that is also outside all other soldiers' polygons
 */
export function getSafePointOutsideSoldierPolygons(maxTries = 25) {
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

	// As a last resort, return any random point in world
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

const BOT_SPAWN_MIN_DISTANCE = 60;
const BOT_SPAWN_MAX_DISTANCE = 200;

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

	return undefined;
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

	return undefined;
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

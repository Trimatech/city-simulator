import { Players } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { store } from "server/store";
import { INITIAL_POLYGON_DIAMETER, INITIAL_POLYGON_ITEMS, WORLD_BOUNDS } from "shared/constants/core";
import { calculatePolygonOperation, isPointInPolygon, vector2ToPoint } from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { createPolygonAroundPosition } from "shared/polygon-extra.utils";
import { selectCandyById } from "shared/store/candy";
import { selectAliveSoldiersById, selectSoldierById } from "shared/store/soldiers";

import { getBotHumanoid } from "./services/bots/bot-registry";
import { soldierGrid } from "./services/soldiers/soldier-grid";

const MIN_SAFE_DISTANCE = 10;

export function getSoldier(soldierId: string) {
	return store.getState(selectSoldierById(soldierId));
}

export function getCandy(candyId: string) {
	return store.getState(selectCandyById(candyId));
}

export function getPlayerHumanoidByName(name: string) {
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
		warn(`No player or bot found for name ${name}`);
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

export function killSoldier(soldierId: string) {
	// if (IS_LOCAL) {
	// 	warn(`[DEBUG] Killing soldier ${soldierId} in local mode`);
	// 	return;
	// }
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
 * Returns a random point in the world. If the margin is specified,
 * the point will be within this percentage of the world bounds.
 */
export function getRandomPointInWorld(margin = 1) {
	const random = new Random();
	let position = new Vector2();

	do {
		const x = random.NextNumber(-margin, margin);
		const y = random.NextNumber(-margin, margin);
		position = new Vector2(x, y).mul(WORLD_BOUNDS);
	} while (position.Magnitude > WORLD_BOUNDS);

	return position;
}

/**
 * Returns a random point in the world that is more likely to be
 * closer to the origin.
 */
export function getRandomPointNearWorldOrigin(margin = 1, passes = 2) {
	let currentPosition = new Vector2();
	let currentDistance = math.huge;

	for (const _ of $range(0, passes)) {
		const position = getRandomPointInWorld(margin);
		const distance = position.Magnitude;

		if (distance < currentDistance) {
			currentPosition = position;
			currentDistance = distance;
		}
	}

	return currentPosition;
}

/**
 * Returns a safe point in the world. This should be a point that is
 * not too close to any other soldier, but not the farthest point either.
 */
export function getSafePointInWorld() {
	const spawns: { position: Vector2; safety: number }[] = [];

	const scoreSafety = (spawn: Vector2) => {
		const nearest = soldierGrid.nearest(spawn, MIN_SAFE_DISTANCE * 2);
		const distance = nearest ? nearest.position.sub(spawn).Magnitude : math.huge;
		return distance;
	};

	for (const _ of $range(0, 10)) {
		const position = getRandomPointNearWorldOrigin(0.8);
		const safety = scoreSafety(position);
		spawns.push({ position, safety });
	}

	const sorted = spawns.sort((a, b) => a.safety < b.safety);

	// Find the first safe spawn that is still close to another soldier
	for (const spawn of sorted) {
		if (spawn.safety > MIN_SAFE_DISTANCE) {
			return spawn.position;
		}
	}

	return sorted[sorted.size() - 1].position;
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
		const candidate = getRandomPointNearWorldOrigin(0.8);
		if (!isInsideAnySoldierPolygon(candidate) && !intersectsAnySoldierPolygon(candidate)) {
			return candidate;
		}
	}

	// As a last resort, return any random point in world
	return getRandomPointInWorld(0.8);
}

import { store } from "server/store";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { selectAliveSoldiersById, selectSoldierById, SoldierEntity } from "shared/store/soldiers";

import { closestPointOnPolygonEdge, getPolygonCentroid } from "./bot-cuts";

interface NearestEnemyResult {
	readonly enemy: SoldierEntity;
	readonly distance: number;
}

interface ExposedEnemyResult {
	readonly enemy: SoldierEntity;
	readonly distance: number;
	readonly trailMidpoint: Vector2;
}

/** Returns the nearest alive enemy soldier to the given position, or undefined if none exist. */
export function getNearestEnemy(botId: string, botPosition: Vector2): NearestEnemyResult | undefined {
	const aliveById = store.getState(selectAliveSoldiersById);
	let nearest: NearestEnemyResult | undefined;

	for (const [id, soldier] of pairs(aliveById)) {
		if (id === botId) continue;
		const d = soldier.position.sub(botPosition).Magnitude;
		if (nearest === undefined || d < nearest.distance) {
			nearest = { enemy: soldier, distance: d };
		}
	}

	return nearest;
}

/** Returns all alive enemies within `radius` studs of the bot. */
export function getEnemiesInRadius(botId: string, botPosition: Vector2, radius: number): NearestEnemyResult[] {
	const aliveById = store.getState(selectAliveSoldiersById);
	const results: NearestEnemyResult[] = [];

	for (const [id, soldier] of pairs(aliveById)) {
		if (id === botId) continue;
		const d = soldier.position.sub(botPosition).Magnitude;
		if (d <= radius) {
			results.push({ enemy: soldier, distance: d });
		}
	}

	return results;
}

/** Finds the closest enemy within `radius` that is outside their polygon with active tracers (vulnerable to trail cuts). */
export function getEnemyWithExposedTrail(
	botId: string,
	botPosition: Vector2,
	radius: number,
): ExposedEnemyResult | undefined {
	const aliveById = store.getState(selectAliveSoldiersById);
	let best: ExposedEnemyResult | undefined;

	for (const [id, soldier] of pairs(aliveById)) {
		if (id === botId) continue;
		// Enemy must be outside their polygon and have active tracers
		if (soldier.isInside || soldier.tracers.size() < 2) continue;

		const d = soldier.position.sub(botPosition).Magnitude;
		if (d > radius) continue;

		// Find midpoint of their trail
		const tracers = soldier.tracers;
		const midIdx = math.floor(tracers.size() / 2);
		const trailMidpoint = tracers[midIdx];

		if (best === undefined || d < best.distance) {
			best = { enemy: soldier, distance: d, trailMidpoint };
		}
	}

	return best;
}

/** Returns the closest point on the bot's own polygon edge to its current position. */
export function getClosestPointOnOwnPolygon(botId: string): Vector2 | undefined {
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier || soldier.polygon.size() < 3) return undefined;

	return closestPointOnPolygonEdge(soldier.polygon as Vector2[], soldier.position).point;
}

/** Finds the closest point on any enemy polygon edge to the bot, with a fast bounds check to skip distant enemies. */
export function getNearestEnemyPolygonEdgePoint(
	botId: string,
	botPosition: Vector2,
): { point: Vector2; enemyId: string } | undefined {
	const aliveById = store.getState(selectAliveSoldiersById);
	let bestPoint: Vector2 | undefined;
	let bestDist = math.huge;
	let bestEnemyId: string | undefined;

	for (const [id, soldier] of pairs(aliveById)) {
		if (id === botId) continue;

		const polygon = soldier.polygon as Vector2[];
		if (polygon.size() < 3) continue;

		// Quick bounds check — skip enemies whose bounding box is farther than the current best
		const bounds = soldier.polygonBounds;
		if (bounds) {
			const expandedDist = math.max(
				math.abs(botPosition.X - (bounds.min.X + bounds.max.X) / 2) - (bounds.max.X - bounds.min.X) / 2,
				math.abs(botPosition.Y - (bounds.min.Y + bounds.max.Y) / 2) - (bounds.max.Y - bounds.min.Y) / 2,
			);
			if (expandedDist > bestDist) continue;
		}

		const { point } = closestPointOnPolygonEdge(polygon, botPosition);
		const d = point.sub(botPosition).Magnitude;
		if (d < bestDist) {
			bestDist = d;
			bestPoint = point;
			bestEnemyId = id as string;
		}
	}

	if (bestPoint !== undefined && bestEnemyId !== undefined) {
		return { point: bestPoint, enemyId: bestEnemyId };
	}
	return undefined;
}

/**
 * Scores a candidate movement direction by sampling a point `sampleDistance` studs away.
 * Higher score = better direction (farther from enemies, not inside enemy territory).
 */
export function scoreDirection(
	botId: string,
	botPosition: Vector2,
	direction: Vector2,
	sampleDistance: number,
): number {
	const aliveById = store.getState(selectAliveSoldiersById);
	const targetPoint = botPosition.add(direction.mul(sampleDistance));
	let score = 0;

	for (const [id, soldier] of pairs(aliveById)) {
		if (id === botId) continue;

		const polygon = soldier.polygon as Vector2[];
		if (polygon.size() < 3) continue;

		const centroid = getPolygonCentroid(polygon);
		const distToEnemy = targetPoint.sub(centroid).Magnitude;
		score += distToEnemy; // farther from enemies = higher score

		// Penalize if sample point lands inside enemy territory
		const bounds = soldier.polygonBounds;
		if (bounds) {
			if (
				targetPoint.X >= bounds.min.X &&
				targetPoint.X <= bounds.max.X &&
				targetPoint.Y >= bounds.min.Y &&
				targetPoint.Y <= bounds.max.Y
			) {
				const points = vectorsToPoints(polygon);
				if (isPointInPolygon(vector2ToPoint(targetPoint), points)) {
					score -= 500;
				}
			}
		}
	}

	return score;
}

/** Returns true if the bot is within `maxDistance` studs of any enemy polygon edge. */
export function isAdjacentToEnemyPolygon(botId: string, maxDistance: number): boolean {
	const pos = store.getState(selectSoldierById(botId))?.position ?? new Vector2();
	const result = getNearestEnemyPolygonEdgePoint(botId, pos);
	return result !== undefined && result.point.sub(pos).Magnitude <= maxDistance;
}

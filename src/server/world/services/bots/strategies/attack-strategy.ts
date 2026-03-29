import { store } from "server/store";
import { selectSoldierById } from "shared/store/soldiers";

import { buildBlobCut, closestPointOnPolygonEdge } from "../bot-cuts";

/**
 * Territory raid: a blob cut aimed toward the nearest enemy polygon.
 * The cut direction points at the enemy, so the arc carves into their territory.
 * Shorter depth since bot is slower in enemy territory (0.7x).
 */
export function buildRaidPath(botId: string, botPosition: Vector2, targetEnemyId: string): Vector2[] {
	const enemy = store.getState(selectSoldierById(targetEnemyId));
	if (!enemy || enemy.polygon.size() < 3) return [];

	const enemyPolygon = enemy.polygon as Vector2[];

	// Direction toward nearest enemy polygon edge
	const { point: enemyEdgePoint } = closestPointOnPolygonEdge(enemyPolygon, botPosition);
	const direction = enemyEdgePoint.sub(botPosition);
	const len = direction.Magnitude;
	if (len < 1) return [];

	return buildBlobCut(botId, botPosition, {
		direction: direction.div(len),
		span: 20 + new Random().NextNumber() * 10,
		depth: 15 + new Random().NextNumber() * 10,
	});
}

/**
 * Trail hunt: walk directly to the enemy tracer, cross it perpendicularly,
 * then return home via a blob cut. The path physically passes through the
 * enemy's tracer line to trigger the kill collision.
 */
export function buildTrailHuntPath(botId: string, botPosition: Vector2, enemyId: string): Vector2[] {
	const enemy = store.getState(selectSoldierById(enemyId));
	if (!enemy || enemy.tracers.size() < 2) return [];

	const bot = store.getState(selectSoldierById(botId));
	if (!bot || bot.polygon.size() < 3) return [];

	const tracers = enemy.tracers;

	// Find the tracer segment closest to the bot
	let bestMid = tracers[0];
	let bestDist = math.huge;
	let bestCrossDir = new Vector2(1, 0);

	for (let i = 0; i < tracers.size() - 1; i++) {
		const a = tracers[i];
		const b = tracers[i + 1];
		const ab = b.sub(a);
		const abLenSq = ab.X * ab.X + ab.Y * ab.Y;
		if (abLenSq < 1e-6) continue;

		// Closest point on this tracer segment to the bot
		const t = math.clamp(botPosition.sub(a).Dot(ab) / abLenSq, 0.2, 0.8);
		const proj = a.add(ab.mul(t));
		const d = proj.sub(botPosition).Magnitude;

		if (d < bestDist) {
			bestDist = d;
			bestMid = proj;
			// Perpendicular direction to cross the tracer
			const segLen = math.sqrt(abLenSq);
			const segUnit = ab.div(segLen);
			bestCrossDir = new Vector2(-segUnit.Y, segUnit.X); // perpendicular
		}
	}

	// Make sure cross direction points roughly away from the bot's polygon
	const botPolygon = bot.polygon as Vector2[];
	const { point: nearestOwnEdge } = closestPointOnPolygonEdge(botPolygon, botPosition);
	const homeDir = nearestOwnEdge.sub(bestMid);
	if (bestCrossDir.Dot(homeDir) > 0) {
		bestCrossDir = bestCrossDir.mul(-1); // flip so we cross away from home first
	}

	// Build path: approach the tracer, cross it, overshoot, then blob cut home
	const crossWidth = 12; // studs to cross on each side of the tracer
	const approachPoint = bestMid.sub(bestCrossDir.mul(crossWidth));
	const crossPoint = bestMid;
	const overshootPoint = bestMid.add(bestCrossDir.mul(crossWidth));

	// The return home is a blob cut from the overshoot position
	const returnCut = buildBlobCut(botId, overshootPoint, {
		span: 15,
		depth: 8,
	});

	// Combine: current pos → approach → cross → overshoot → return cut
	const waypoints: Vector2[] = [botPosition, approachPoint, crossPoint, overshootPoint];

	// Append return cut waypoints (skip its first point which is overshootPoint)
	for (let i = 1; i < returnCut.size(); i++) {
		waypoints.push(returnCut[i]);
	}

	return waypoints;
}

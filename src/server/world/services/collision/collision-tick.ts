import { store } from "server/store";
import { getSoldier, killSoldier } from "server/world/utils";
import { WORLD_BOUNDS } from "shared/constants/core";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { describeSoldierFromScore, selectSoldiersSorted, SoldierEntity } from "shared/store/soldiers";

import { soldierGrid } from "../soldiers";

function doLinesIntersect(p1: Vector2, p2: Vector2, q1: Vector2, q2: Vector2): boolean {
	const det = (p2.X - p1.X) * (q2.Y - q1.Y) - (p2.Y - p1.Y) * (q2.X - q1.X);
	if (det === 0) return false; // Lines are parallel

	const lambda = ((q2.Y - q1.Y) * (q2.X - p1.X) + (q1.X - q2.X) * (q2.Y - p1.Y)) / det;
	const gamma = ((p1.Y - p2.Y) * (q2.X - p1.X) + (p2.X - p1.X) * (q2.Y - p1.Y)) / det;

	return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

function checkCollisionWithTracers(soldier: SoldierEntity): boolean {
	const headPosition = soldier.position;
	const lastPoint = soldier.tracers[soldier.tracers.size() - 1];

	for (let i = 0; i < soldier.tracers.size() - 1; i++) {
		const startPoint = soldier.tracers[i];
		const endPoint = soldier.tracers[i + 1];

		if (doLinesIntersect(headPosition, lastPoint, startPoint, endPoint)) {
			print(`Collision detected for soldier ${soldier.id} with its own tracer line ${i}`, {
				headPosition,
				lastPoint,
				startPoint,
				endPoint,
			});
			return true;
		}
	}

	return false;
}

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest score is killed
	const soldiers = store.getState(selectSoldiersSorted((a, b) => a.score < b.score));

	for (const soldier of soldiers) {
		if (soldier.dead) {
			continue;
		}

		if (isCollidingWithWall(soldier)) {
			killSoldier(soldier.id);
			continue;
		}

		const isInside = isInsidePolygon(soldier);

		const hasChanged = soldier.isInside !== isInside;
		if (hasChanged) {
			store.setSoldierIsInside(soldier.id, isInside);
		}

		const enemy = isCollidingWithSoldier(soldier);

		if (enemy) {
			killSoldier(soldier.id);
			store.playerKilledSoldier(enemy.id, soldier.id);
			store.incrementSoldierEliminations(enemy.id);
		}

		// New check for collision with own tracers
		if (checkCollisionWithTracers(soldier)) {
			// Handle collision with own tracers
			print(`Collision detected for soldier ${soldier.id} with its own tracers.`);
			// Implement collision response logic here
			killSoldier(soldier.id);
		}
	}
}

function isInsidePolygon(soldier: SoldierEntity) {
	const polygon = vectorsToPoints(soldier.polygon as Vector2[]);

	return isPointInPolygon(vector2ToPoint(soldier.position), polygon);
}

function isCollidingWithWall(soldier: SoldierEntity) {
	const radius = describeSoldierFromScore(soldier.score).radius;
	return soldier.position.Magnitude + radius > WORLD_BOUNDS;
}

function isCollidingWithSoldier(soldier: SoldierEntity) {
	const radius = describeSoldierFromScore(soldier.score).radius;

	const nearest = soldierGrid.nearest(soldier.position, radius + 5, (data) => {
		const enemy = getSoldier(data.metadata.id);
		return enemy !== undefined && !enemy.dead && enemy.id !== soldier.id;
	});

	const enemy = nearest && getSoldier(nearest.metadata.id);

	if (!enemy) {
		return;
	}

	const enemyRadius = describeSoldierFromScore(enemy.score).radius;
	const distance = nearest.position.sub(soldier.position).Magnitude;

	if (distance <= 0.8 * (radius + enemyRadius)) {
		return enemy;
	}
}

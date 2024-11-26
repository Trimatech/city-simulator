import { store } from "server/store";
import { getSoldier, killSoldier } from "server/world/world.utils";
import { WORLD_BOUNDS } from "shared/constants/core";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { selectSoldiersSorted, SoldierEntity } from "shared/store/soldiers";
import { SOLDIER_RADIUS_BASE } from "shared/store/soldiers/soldier-utils";

import { soldierGrid } from "../soldiers";

function doLinesIntersect(p1: Vector2, p2: Vector2, q1: Vector2, q2: Vector2): boolean {
	const det = (p2.X - p1.X) * (q2.Y - q1.Y) - (p2.Y - p1.Y) * (q2.X - q1.X);
	if (det === 0) return false; // Lines are parallel

	const lambda = ((q2.Y - q1.Y) * (q2.X - p1.X) + (q1.X - q2.X) * (q2.Y - p1.Y)) / det;
	const gamma = ((p1.Y - p2.Y) * (q2.X - p1.X) + (p2.X - p1.X) * (q2.Y - p1.Y)) / det;

	return 0 <= lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

function checkCollisionWithTracers(soldier: SoldierEntity): boolean {
	const headPosition = soldier.position;
	const lastPoint = soldier.tracers[soldier.tracers.size() - 1];
	const secondLastPoint = soldier.tracers[soldier.tracers.size() - 2];

	for (let i = 0; i < soldier.tracers.size() - 1; i++) {
		const startPoint = soldier.tracers[i];
		const endPoint = soldier.tracers[i + 1];

		if (
			doLinesIntersect(headPosition, lastPoint, startPoint, endPoint) ||
			doLinesIntersect(lastPoint, secondLastPoint, startPoint, endPoint)
		) {
			print(`Collision detected for soldier ${soldier.id} with its own tracer line ${i}`, {
				headPosition,
				lastPoint,
				secondLastPoint,
				startPoint,
				endPoint,
			});
			return true;
		}
	}

	return false;
}

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest area is killed
	const soldiers = store.getState(selectSoldiersSorted((a, b) => a.polygonAreaSize < b.polygonAreaSize));

	for (const soldier of soldiers) {
		if (soldier.dead) {
			continue;
		}

		if (isCollidingWithWall(soldier)) {
			print(`Collided with wall, kill soldier ${soldier.id}`);
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
			print(`Collided with enemy, kill soldier ${enemy.id}`);
			killSoldier(enemy.id);
			store.playerKilledSoldier(soldier.id, enemy.id);
			store.incrementSoldierEliminations(enemy.id);
		}

		// New check for collision with own tracers
		if (checkCollisionWithTracers(soldier)) {
			// Handle collision with own tracers
			print(`Collided with own tracer, kill soldier ${soldier.id}`);
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
	const radius = SOLDIER_RADIUS_BASE;
	return soldier.position.Magnitude + radius > WORLD_BOUNDS;
}

function isCollidingWithSoldier(soldier: SoldierEntity) {
	const radius = SOLDIER_RADIUS_BASE;

	const nearest = soldierGrid.nearest(soldier.position, radius + 5, (data) => {
		const enemy = getSoldier(data.metadata.id);
		return enemy !== undefined && !enemy.dead && enemy.id !== soldier.id;
	});

	const enemy = nearest && getSoldier(nearest.metadata.id);

	if (!enemy) {
		return;
	}

	const enemyRadius = SOLDIER_RADIUS_BASE;
	const distance = nearest.position.sub(soldier.position).Magnitude;

	if (distance <= 0.8 * (radius + enemyRadius)) {
		return enemy;
	}
}

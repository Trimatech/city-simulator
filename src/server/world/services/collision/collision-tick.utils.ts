import { store } from "server/store";
import { getSoldier } from "server/world/world.utils";
import { WORLD_BOUNDS } from "shared/constants/core";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { SOLDIER_RADIUS_BASE, SoldierEntity, selectSoldiers } from "shared/store/soldiers";

import { soldierGrid } from "../soldiers";

function doLinesIntersect(p1: Vector2, p2: Vector2, q1: Vector2, q2: Vector2): boolean {
	const det = (p2.X - p1.X) * (q2.Y - q1.Y) - (p2.Y - p1.Y) * (q2.X - q1.X);
	if (det === 0) return false; // Lines are parallel

	const lambda = ((q2.Y - q1.Y) * (q2.X - p1.X) + (q1.X - q2.X) * (q2.Y - p1.Y)) / det;
	const gamma = ((p1.Y - p2.Y) * (q2.X - p1.X) + (p2.X - p1.X) * (q2.Y - p1.Y)) / det;

	return 0 <= lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

// export function checkCollisionWithTracers(soldier: SoldierEntity): boolean {
// 	if (soldier.tracers.size() < 2) return false;
// 	const headPosition = soldier.position;
// 	const lastPoint = soldier.tracers[soldier.tracers.size() - 1];
// 	const secondLastPoint = soldier.tracers[soldier.tracers.size() - 2];

// 	for (let i = 0; i < soldier.tracers.size() - 1; i++) {
// 		const startPoint = soldier.tracers[i];
// 		const endPoint = soldier.tracers[i + 1];

// 		if (
// 			doLinesIntersect(headPosition, lastPoint, startPoint, endPoint) ||
// 			doLinesIntersect(lastPoint, secondLastPoint, startPoint, endPoint)
// 		) {
// 			print(`Collision detected for soldier ${soldier.id} with its own tracer line ${i}`, {
// 				headPosition,
// 				lastPoint,
// 				secondLastPoint,
// 				startPoint,
// 				endPoint,
// 			});
// 			return true;
// 		}
// 	}

// 	return false;
// }

export function checkCollisionWithTracers(headPosition: Vector2, tracers: Vector2[]): boolean {
	const lastPoint = tracers[tracers.size() - 1];
	const secondLastPoint = tracers[tracers.size() - 2];

	// print(`Checking collision with tracers`, {
	// 	tracers,
	// });

	for (let i = 0; i < tracers.size() - 1; i++) {
		const startPoint = tracers[i];
		const endPoint = tracers[i + 1];

		if (
			doLinesIntersect(headPosition, lastPoint, startPoint, endPoint) ||
			doLinesIntersect(lastPoint, secondLastPoint, startPoint, endPoint)
		) {
			print(`Collision detected with tracer line ${i}`, {
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

// export function checkCollisionWithEnemyTracers(soldier: SoldierEntity): string | undefined {
// 	const moveStart = soldier.lastPosition;
// 	const moveEnd = soldier.position;

// 	const soldiersById = store.getState(selectSoldiersById);
// 	for (const [ownerId, enemy] of pairs(soldiersById)) {
// 		if (!enemy || enemy.dead || ownerId === soldier.id) continue;
// 		const tracers = enemy.tracers;
// 		if (tracers.size() < 2) continue;
// 		for (let i = 0; i < tracers.size() - 1; i++) {
// 			const startPoint = tracers[i];
// 			const endPoint = tracers[i + 1];
// 			if (doLinesIntersect(moveStart, moveEnd, startPoint, endPoint)) {
// 				return ownerId as string;
// 			}
// 		}
// 	}
// 	return undefined;
// }

export function isInsidePolygon(soldier: SoldierEntity) {
	// Early exit: Check bounding box first (cheap AABB check)
	const bounds = soldier.polygonBounds;
	if (bounds) {
		const pos = soldier.position;
		if (pos.X < bounds.min.X || pos.X > bounds.max.X || pos.Y < bounds.min.Y || pos.Y > bounds.max.Y) {
			return false;
		}
	}

	// Only do expensive point-in-polygon check if inside bounding box
	const polygon = vectorsToPoints(soldier.polygon as Vector2[]);
	return isPointInPolygon(vector2ToPoint(soldier.position), polygon);
}

export function isInsideAnyEnemyPolygon(soldier: SoldierEntity): boolean {
	const soldiers = store.getState(selectSoldiers);
	const pos = soldier.position;

	for (const other of soldiers) {
		if (other.id === soldier.id || other.dead) continue;

		const bounds = other.polygonBounds;
		if (bounds) {
			if (pos.X < bounds.min.X || pos.X > bounds.max.X || pos.Y < bounds.min.Y || pos.Y > bounds.max.Y) {
				continue;
			}
		}

		const polygon = vectorsToPoints(other.polygon as Vector2[]);
		if (isPointInPolygon(vector2ToPoint(pos), polygon)) {
			return true;
		}
	}

	return false;
}

export function isCollidingWithWall(soldier: SoldierEntity) {
	const radius = SOLDIER_RADIUS_BASE;
	return soldier.position.Magnitude + radius > WORLD_BOUNDS;
}

export function isCollidingWithOwnTracers(soldier: SoldierEntity) {
	const radius = SOLDIER_RADIUS_BASE;

	const nearest = soldierGrid.nearest(soldier.position, radius + 5, (data) => {
		const me = getSoldier(data.metadata.id);
		return me !== undefined && !me.dead && me.id === soldier.id;
	});

	const me = nearest && getSoldier(nearest.metadata.id);

	if (!me) {
		return;
	}

	if (!nearest || !nearest.metadata.tracers) {
		//print(`No tracer data found for soldier ${soldier.id}`);
		return;
	}

	return checkCollisionWithTracers(me.position, nearest.metadata.tracers);
}

export function isCollidingWithEnemyTracers(soldier: SoldierEntity) {
	const radius = SOLDIER_RADIUS_BASE;

	const nearest = soldierGrid.nearest(soldier.position, radius + 5, (data) => {
		const enemy = getSoldier(data.metadata.id);
		return enemy !== undefined && !enemy.dead && enemy.id !== soldier.id;
	});

	const enemy = nearest && getSoldier(nearest.metadata.id);

	if (!enemy) {
		return;
	}

	if (!nearest || !nearest.metadata.tracers) {
		//	print(`No tracer data found for soldier ${enemy.id}`);
		return;
	}

	const moveStart = soldier.lastPosition;
	const moveEnd = soldier.position;
	const tracers = nearest.metadata.tracers as Vector2[];

	for (let i = 0; i < tracers.size() - 1; i++) {
		const startPoint = tracers[i];
		const endPoint = tracers[i + 1];
		if (doLinesIntersect(moveStart, moveEnd, startPoint, endPoint)) {
			return enemy.id;
		}
	}
}

export function isCollidingWithSoldier(soldier: SoldierEntity) {
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

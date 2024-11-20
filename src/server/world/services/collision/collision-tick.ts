import { store } from "server/store";
import { getSnake, killSnake } from "server/world/utils";
import { WORLD_BOUNDS } from "shared/constants/core";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { describeSnakeFromScore, selectSnakesSorted, SnakeEntity } from "shared/store/snakes";

import { snakeGrid } from "../snakes";

function doLinesIntersect(p1: Vector2, p2: Vector2, q1: Vector2, q2: Vector2): boolean {
	const det = (p2.X - p1.X) * (q2.Y - q1.Y) - (p2.Y - p1.Y) * (q2.X - q1.X);
	if (det === 0) return false; // Lines are parallel

	const lambda = ((q2.Y - q1.Y) * (q2.X - p1.X) + (q1.X - q2.X) * (q2.Y - p1.Y)) / det;
	const gamma = ((p1.Y - p2.Y) * (q2.X - p1.X) + (p2.X - p1.X) * (q2.Y - p1.Y)) / det;

	return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}

function checkCollisionWithTracers(snake: SnakeEntity): boolean {
	const headPosition = snake.position;
	const lastPoint = snake.tracers[snake.tracers.size() - 1];

	for (let i = 0; i < snake.tracers.size() - 1; i++) {
		const startPoint = snake.tracers[i];
		const endPoint = snake.tracers[i + 1];

		if (doLinesIntersect(headPosition, lastPoint, startPoint, endPoint)) {
			print(`Collision detected for snake ${snake.id} with its own tracer line ${i}`, {
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
	// in a head-on collision, the snake with the lowest score is killed
	const snakes = store.getState(selectSnakesSorted((a, b) => a.score < b.score));

	for (const snake of snakes) {
		if (snake.dead) {
			continue;
		}

		if (isCollidingWithWall(snake)) {
			killSnake(snake.id);
			continue;
		}

		const isInside = isInsidePolygon(snake);

		const hasChanged = snake.isInside !== isInside;
		if (hasChanged) {
			store.setSnakeIsInside(snake.id, isInside);
		}

		const enemy = isCollidingWithSnake(snake);

		if (enemy) {
			killSnake(snake.id);
			store.playerKilledSnake(enemy.id, snake.id);
			store.incrementSnakeEliminations(enemy.id);
		}

		// New check for collision with own tracers
		if (checkCollisionWithTracers(snake)) {
			// Handle collision with own tracers
			print(`Collision detected for snake ${snake.id} with its own tracers.`);
			// Implement collision response logic here
			killSnake(snake.id);
		}
	}
}

function isInsidePolygon(snake: SnakeEntity) {
	const polygon = vectorsToPoints(snake.polygon as Vector2[]);

	return isPointInPolygon(vector2ToPoint(snake.position), polygon);
}

function isCollidingWithWall(snake: SnakeEntity) {
	const radius = describeSnakeFromScore(snake.score).radius;
	return snake.position.Magnitude + radius > WORLD_BOUNDS;
}

function isCollidingWithSnake(snake: SnakeEntity) {
	const radius = describeSnakeFromScore(snake.score).radius;

	const nearest = snakeGrid.nearest(snake.position, radius + 5, (data) => {
		const enemy = getSnake(data.metadata.id);
		return enemy !== undefined && !enemy.dead && enemy.id !== snake.id;
	});

	const enemy = nearest && getSnake(nearest.metadata.id);

	if (!enemy) {
		return;
	}

	const enemyRadius = describeSnakeFromScore(enemy.score).radius;
	const distance = nearest.position.sub(snake.position).Magnitude;

	if (distance <= 0.8 * (radius + enemyRadius)) {
		return enemy;
	}
}

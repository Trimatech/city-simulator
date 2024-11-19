import { store } from "server/store";
import { getSnake, killSnake } from "server/world/utils";
import { WORLD_BOUNDS } from "shared/constants/core";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { describeSnakeFromScore, selectSnakesSorted, SnakeEntity } from "shared/store/snakes";

import { snakeGrid } from "../snakes";

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

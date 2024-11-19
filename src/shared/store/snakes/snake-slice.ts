import { createProducer } from "@rbxts/reflex";
import { SNAKE_BOOST_SPEED, SNAKE_SPEED, WORLD_TICK } from "shared/constants/core";
import {
	calculatePolygonOperation,
	pointsToVectors,
	setIntersectionPoints,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { map, turnRadians } from "shared/utils/math-utils";
import { fillArray, mapProperties, mapProperty } from "shared/utils/object-utils";

import { describeSnakeFromScore, snakeIsBoosting } from "./snake-utils";

export interface SnakesState {
	readonly [id: string]: SnakeEntity | undefined;
}

export interface SnakeEntity {
	readonly id: string;
	readonly name: string;
	readonly head: Vector2;
	readonly angle: number;
	readonly desiredAngle: number;
	readonly score: number;
	readonly boost: boolean;
	readonly tracers: readonly Vector2[];
	readonly skin: string;
	readonly dead: boolean;
	readonly eliminations: number;
	readonly polygon: readonly Vector2[];
	readonly isInside: boolean;
}

// Used to prevent tracers from overlapping
const TINY = 0.0001;

const defaultEntity: SnakeEntity = {
	id: "",
	name: "",
	head: new Vector2(),
	angle: 0,
	desiredAngle: 0,
	score: 10,
	boost: false,
	tracers: [],
	skin: "",
	dead: false,
	eliminations: 0,
	polygon: [],
	isInside: true,
};

const initialState: SnakesState = {};

const createPolygonAroundHead = (head: Vector2) => {
	const diameter = 5;
	const items = 20;

	print("Create polygon to head:", head);
	return fillArray(items, (index) => {
		const angle = (index / items) * (2 * math.pi);
		return head.add(new Vector2(math.cos(angle), math.sin(angle)).mul(diameter));
	});
};

export const snakesSlice = createProducer(initialState, {
	addSnake: (state, id: string, patch?: Partial<SnakeEntity>) => {
		const polygon = createPolygonAroundHead(patch?.head || defaultEntity.head);

		return {
			...state,
			[id]: { ...defaultEntity, id, name: id, polygon, ...patch },
		};
	},

	removeSnake: (state, id: string) => ({
		...state,
		[id]: undefined,
	}),

	snakeTick: (state, deltaTime: number = WORLD_TICK) => {
		return mapProperties(state, (snake) => {
			if (snake.dead) {
				return snake;
			}

			if (snake.score < 0) {
				// It's possible for score to be patched to a negative value, so
				// correct it here
				snake = { ...snake, score: 0 };
			}

			const description = describeSnakeFromScore(snake.score);

			const speed = snakeIsBoosting(snake) ? SNAKE_BOOST_SPEED : SNAKE_SPEED;
			const angle = turnRadians(snake.angle, snake.desiredAngle, description.turnSpeed * deltaTime);
			const direction = new Vector2(math.cos(angle), math.sin(angle));
			const head = snake.head.add(direction.mul(speed * deltaTime));

			const currentLength = snake.tracers.size();
			const desiredLength = 100;
			let tail = head;

			const tracers = snake.tracers.mapFiltered((tracer, index) => {
				if (snake.isInside) {
					return;
				}

				const previous = snake.tracers[index - 1] || snake.head;

				// spacing should be longer near the end of the snake to allow longer
				// snakes but with less tracers
				const spacing = map(index, 0, currentLength, description.spacingAtHead, description.spacingAtTail);

				// the alpha of the interpolation that will decide the space between
				// the current tracer and the previous tracer
				const alpha = math.clamp((deltaTime * speed) / spacing, TINY, 1 - TINY);

				if (index === desiredLength - 1) {
					// the tail's spacing from the previous tracer should be proportional
					// to the score needed to reach the next length
					tail = tail.Lerp(tracer.Lerp(previous, alpha), math.max(description.length % 1, TINY));
				} else {
					tail = tracer.Lerp(previous, alpha);
				}

				return tail;
			});

			if (currentLength < desiredLength) {
				for (const index of $range(currentLength, desiredLength - 1)) {
					tracers.push(tail.add(new Vector2(TINY * (index + 1), 0)));
				}
			}

			return { ...snake, head, angle, tracers };
		});
	},

	setSnakeIsInside: (state, id: string, isInside: boolean) => {
		return mapProperty(state, id, (snake) => {
			const hasChanged = snake.isInside !== isInside;
			warn(`Snake is inside: ${isInside}`);
			if (hasChanged) {
				if (isInside) {
					// Calculate new polygon based on old polygon and tracers

					const resultPolygon = pointsToPolygon(vectorsToPoints(snake.polygon as Vector2[]));
					const points = vectorsToPoints(snake.tracers as Vector2[]);
					const newCutPolygon = setIntersectionPoints(resultPolygon, points);

					if (newCutPolygon) {
						const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");

						if (result.regions.size() > 0 && result.regions[0].size() > 2) {
							const resultPolygon = pointsToVectors(result.regions[0] as Point[]);
							warn("Snake is inside and intersection found", resultPolygon);
							return {
								...snake,
								isInside,
								polygon: resultPolygon,
							};
						} else {
							warn("Snake is inside but no regions found");
						}
					} else {
						warn("Snake is inside but no intersection found");
					}
				}

				return {
					...snake,
					isInside,
				};
			}

			return snake;
		});
	},

	turnSnake: (state, id: string, desiredAngle: number) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			desiredAngle,
		}));
	},

	boostSnake: (state, id: string, boost: boolean) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			boost,
		}));
	},

	setSnakeIsDead: (state, id: string) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			dead: true,
		}));
	},

	patchSnake: (state, id: string, intersection: Partial<SnakeEntity>) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			...intersection,
		}));
	},

	incrementSnakeScore: (state, id: string, amount: number) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			score: math.max(snake.score + amount, 0),
		}));
	},

	incrementSnakeEliminations: (state, id: string) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			eliminations: snake.eliminations + 1,
		}));
	},
});

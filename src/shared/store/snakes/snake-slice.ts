import { createProducer } from "@rbxts/reflex";
import {
	calculatePolygonOperation,
	pointsToVectors,
	setIntersectionPoints,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { fillArray, mapProperties, mapProperty } from "shared/utils/object-utils";

export interface SnakesState {
	readonly [id: string]: SnakeEntity | undefined;
}

export interface SnakeEntity {
	readonly id: string;
	readonly name: string;
	readonly position: Vector2;
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
	position: new Vector2(),
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
		const polygon = createPolygonAroundHead(patch?.position || defaultEntity.position);

		return {
			...state,
			[id]: { ...defaultEntity, id, name: id, polygon, ...patch },
		};
	},

	removeSnake: (state, id: string) => ({
		...state,
		[id]: undefined,
	}),

	snakeTick: (state) => {
		return mapProperties(state, (snake) => {
			if (snake.dead) {
				return snake;
			}

			const currentLength = snake.tracers.size();

			const tracers = [...snake.tracers];

			const bodyPieceLength = 0.5;

			// Add a tracer if the distance between the last tracer and the current head is 1.5
			if (currentLength > 0) {
				const lastTracer = snake.tracers[currentLength - 1];
				const distance = lastTracer.sub(snake.position).Magnitude;
				warn("Distance", distance);
				if (distance > bodyPieceLength) {
					tracers.push(snake.position);
				}
			} else {
				tracers.push(snake.position);
			}

			return { ...snake, tracers };
		});
	},

	setSnakeIsInside: (state, id: string, isInside: boolean) => {
		return mapProperty(state, id, (snake) => {
			const hasChanged = snake.isInside !== isInside;
			//warn(`Snake is inside: ${isInside}`);
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
							//warn("Snake is inside and intersection found", resultPolygon);
							return {
								...snake,
								isInside,
								polygon: resultPolygon,
								tracers: [],
							};
						} else {
							warn("No valid REGIONS found", {
								result,
								points,
								newCutPolygon,
							});
						}
					} else {
						warn("No INTERSECTION found", {
							points,
							newCutPolygon,
						});
					}
				}

				return {
					...snake,
					isInside,
					tracers: [],
				};
			}

			return snake;
		});
	},

	moveSnake: (state, id: string, position: Vector2) => {
		return mapProperty(state, id, (snake) => ({
			...snake,
			position,
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

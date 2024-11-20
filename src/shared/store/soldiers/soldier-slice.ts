import { createProducer } from "@rbxts/reflex";
import {
	calculatePolygonOperation,
	pointsToVectors,
	setIntersectionPoints,
	vectorsToPoints,
} from "shared/polybool/poly-utils";
import { Point, pointsToPolygon } from "shared/polybool/polybool";
import { fillArray, mapProperties, mapProperty } from "shared/utils/object-utils";

export interface SoldiersState {
	readonly [id: string]: SoldierEntity | undefined;
}

export interface SoldierEntity {
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
	readonly polygonAreaSize: number;
	readonly isInside: boolean;
}

const defaultEntity: SoldierEntity = {
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
	polygonAreaSize: 0,
	isInside: true,
};

const initialState: SoldiersState = {};

const createPolygonAroundHead = (position: Vector2) => {
	const diameter = 20;
	const items = 40;

	print("Create polygon to head:", position);
	return fillArray(items, (index) => {
		const angle = (index / items) * (2 * math.pi);
		return position.add(new Vector2(math.cos(angle) * diameter, math.sin(angle) * diameter));
	});
};

const calculatePolygonArea = (polygon: readonly Vector2[]) => {
	let area = 0;
	const length = polygon.size();

	if (length < 3) return 0;

	for (let i = 0; i < length; i++) {
		const j = (i + 1) % length;
		area += polygon[i].X * polygon[j].Y;
		area -= polygon[j].X * polygon[i].Y;
	}

	return math.round(math.abs(area) / 2);
};

export const soldiersSlice = createProducer(initialState, {
	addSoldier: (state, id: string, patch?: Partial<SoldierEntity>) => {
		const polygon = createPolygonAroundHead(patch?.position || defaultEntity.position);
		const polygonAreaSize = calculatePolygonArea(polygon);

		return {
			...state,
			[id]: { ...defaultEntity, id, name: id, polygon, polygonAreaSize, ...patch },
		};
	},

	removeSoldier: (state, id: string) => ({
		...state,
		[id]: undefined,
	}),

	soldierTick: (state) => {
		return mapProperties(state, (soldier) => {
			if (soldier.dead) {
				return soldier;
			}

			if (soldier.isInside) {
				return soldier;
			}

			const currentLength = soldier.tracers.size();
			const tracers = [...soldier.tracers];
			const bodyPieceLength = 2;

			if (currentLength > 0) {
				const lastTracer = soldier.tracers[currentLength - 1];
				const distance = lastTracer.sub(soldier.position).Magnitude;

				if (distance > bodyPieceLength) {
					warn("Distance", { distance, position: soldier.position });
					tracers.push(soldier.position);
				}
			} else {
				tracers.push(soldier.position);
			}

			return { ...soldier, tracers };
		});
	},

	setSoldierIsInside: (state, id: string, isInside: boolean) => {
		return mapProperty(state, id, (soldier) => {
			const hasChanged = soldier.isInside !== isInside;

			if (hasChanged) {
				warn(`Soldier is inside: ${isInside}`);
				if (isInside) {
					// Calculate new polygon based on old polygon and tracers

					const resultPolygon = pointsToPolygon(vectorsToPoints(soldier.polygon as Vector2[]));
					const points = vectorsToPoints(soldier.tracers as Vector2[]);
					const newCutPolygon = setIntersectionPoints(resultPolygon, points);

					if (newCutPolygon) {
						const result = calculatePolygonOperation(resultPolygon, newCutPolygon, "Union");

						if (result.regions.size() > 0 && result.regions[0].size() > 2) {
							const resultPolygon = pointsToVectors(result.regions[0] as Point[]);
							const polygonAreaSize = calculatePolygonArea(resultPolygon);
							return { ...soldier, isInside, polygon: resultPolygon, polygonAreaSize, tracers: [] };
						} else {
							warn("No valid REGIONS found", { result, points, newCutPolygon });
						}
					} else {
						warn("No INTERSECTION found", { points, newCutPolygon });
					}

					return { ...soldier, isInside, tracers: [] };
				} else {
					return { ...soldier, isInside, tracers: [soldier.position] };
				}
			}

			return soldier;
		});
	},

	moveSoldier: (state, id: string, position: Vector2) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			position,
		}));
	},

	boostSoldier: (state, id: string, boost: boolean) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			boost,
		}));
	},

	setSoldierIsDead: (state, id: string) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			dead: true,
		}));
	},

	patchSoldier: (state, id: string, intersection: Partial<SoldierEntity>) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			...intersection,
		}));
	},

	incrementSoldierscore: (state, id: string, amount: number) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			score: math.max(soldier.score + amount, 0),
		}));
	},

	incrementSoldierEliminations: (state, id: string) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			eliminations: soldier.eliminations + 1,
		}));
	},
});

import { createProducer } from "@rbxts/reflex";
import { INITIAL_POLYGON_DIAMETER, INITIAL_POLYGON_ITEMS, TRACER_PIECE_LENGTH } from "shared/constants/core";
import { connectLineToPolygon, pointsToVectors, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { pointsToPolygon } from "shared/polybool/polybool";
import { calculatePolygonArea, createPolygonAroundPosition } from "shared/polygon-extra.utils";
import { mapProperties, mapProperty } from "shared/utils/object-utils";

export interface SoldiersState {
	readonly [id: string]: SoldierEntity | undefined;
}

export interface SoldierEntity {
	readonly id: string;
	readonly name: string;
	readonly lastPosition: Vector2;
	readonly position: Vector2;
	readonly angle: number;
	readonly desiredAngle: number;
	readonly orbs: number;
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
	lastPosition: new Vector2(),
	angle: 0,
	desiredAngle: 0,
	orbs: 0,
	tracers: [],
	skin: "",
	dead: false,
	eliminations: 0,
	polygon: [],
	polygonAreaSize: 0,
	isInside: true,
};

const initialState: SoldiersState = {};

export const soldiersSlice = createProducer(initialState, {
	addSoldier: (state, id: string, patch?: Partial<SoldierEntity>) => {
		print(`Add soldier ${id}`, { patch });
		const polygon = createPolygonAroundPosition(
			patch?.position || defaultEntity.position,
			INITIAL_POLYGON_DIAMETER,
			INITIAL_POLYGON_ITEMS,
		);
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

			if (currentLength > 0) {
				const lastTracer = soldier.tracers[currentLength - 1];
				const distance = lastTracer.sub(soldier.position).Magnitude;

				if (distance >= TRACER_PIECE_LENGTH) {
					tracers.push(soldier.position);
				}
			} else if (soldier.lastPosition) {
				const withIntersection = connectLineToPolygon(
					[vector2ToPoint(soldier.lastPosition), vector2ToPoint(soldier.position)],
					pointsToPolygon(vectorsToPoints(soldier.polygon)),
				);
				const points = pointsToVectors(withIntersection);
				tracers.push(points[0]);

				if (points.size() > 1) {
					tracers.push(points[1]);
				}
			}

			if (tracers.size() !== currentLength) {
				return { ...soldier, tracers };
			}

			return soldier;
		});
	},

	setSoldierIsInside: (state, id: string, isInside: boolean) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			isInside,
		}));
	},

	setSoldierPolygon: (state, id: string, polygon: Vector2[], polygonAreaSize: number, resetTracers = false) => {
		print(`setSoldierPolygon ${id}`, { polygon, polygonAreaSize });
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			polygon,
			polygonAreaSize,
			tracers: resetTracers ? [] : soldier.tracers,
		}));
	},

	clearSoldierTracers: (state, id: string) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			tracers: [],
		}));
	},

	setSoldierTracers: (state, id: string, tracers: Vector2[]) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			tracers,
		}));
	},

	moveSoldier: (state, id: string, position: Vector2) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			position,
			lastPosition: soldier.position,
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

	incrementSoldierOrbs: (state, id: string, amount: number) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			orbs: math.max(soldier.orbs + math.abs(amount), 0),
		}));
	},

	decrementSoldierOrbs: (state, id: string, amount: number) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			orbs: math.max(soldier.orbs - math.abs(amount), 0),
		}));
	},

	incrementSoldierEliminations: (state, id: string) => {
		return mapProperty(state, id, (soldier) => ({
			...soldier,
			eliminations: soldier.eliminations + 1,
		}));
	},
});

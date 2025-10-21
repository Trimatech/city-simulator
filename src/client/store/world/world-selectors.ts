import { createSelector } from "@rbxts/reflex";
import { SOLDIER_RADIUS_BASE } from "shared/store/soldiers";
import { mapStrict } from "shared/utils/math-utils";

import { RootState } from "..";

export interface WorldCamera {
	readonly subject?: string;
	readonly offset: Vector2;
	readonly scale: number;
}

const WORLD_SCALE = 4;

export const selectWorldSubject = (state: RootState) => {
	return state.world.subject;
};

export const selectWorldSpectating = (state: RootState) => {
	return state.world.spectating;
};

export const selectSoldierFromWorldSubject = (state: RootState) => {
	return state.soldiers[state.world.subject];
};

export const selectWorldSubjectDead = (state: RootState) => {
	return state.soldiers[state.world.subject]?.dead ?? false;
};

export const selectWorldSubjectPosition = (state: RootState) => {
	return state.soldiers[state.world.subject]?.position ?? Vector2.zero;
};

export const selectWorldSubjectDesiredAngle = (state: RootState) => {
	return state.soldiers[state.world.subject]?.desiredAngle ?? 0;
};

export const selectWorldSubjectOrbs = (state: RootState) => {
	return state.soldiers[state.world.subject]?.orbs ?? 0;
};

const emptyTracers: Vector2[] = [];

export const selectWorldSubjectTracers = (state: RootState) => {
	return state.soldiers[state.world.subject]?.tracers ?? emptyTracers;
};

export const selectWorldSubjectTracersSize = (state: RootState) => {
	return state.soldiers[state.world.subject]?.tracers?.size() ?? 0;
};

export const selectWorldSubjectPolygonAreaSize = (state: RootState) => {
	return state.soldiers[state.world.subject]?.polygonAreaSize ?? 0;
};

export const selectWorldCamera = createSelector(
	[selectSoldierFromWorldSubject],
	(soldier) => {
		if (!soldier) {
			return {
				subject: undefined,
				offset: new Vector2(),
				scale: WORLD_SCALE,
			};
		}

		const radius = SOLDIER_RADIUS_BASE;

		return {
			subject: soldier.id,
			offset: soldier.position.mul(-1),
			scale: mapStrict(radius, 0.5, 3, WORLD_SCALE, WORLD_SCALE * 0.5),
		};
	},
	{
		// only re-compute if the soldier is not null
		equalityCheck: (current, previous) => current === previous || current === undefined,
	},
);

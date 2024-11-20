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

export const selectSoldierspectated = (state: RootState) => {
	return state.soldiers[state.world.spectating];
};

export const selectWorldInputAngle = (isClient = true) => {
	return (state: RootState) => {
		return isClient ? state.world.inputAngle : 0;
	};
};

export const selectSoldierFromWorldSubject = (state: RootState) => {
	return state.soldiers[state.world.subject];
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

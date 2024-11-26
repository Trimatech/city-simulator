import Object from "@rbxts/object-utils";
import { createSelector } from "@rbxts/reflex";
import { RootState } from "server/store";

import { TowerEntity } from "./tower-slice";

export const selectTowersState = (state: RootState) => state.towers;

export const selectTowersById = createSelector(selectTowersState, (towers) => towers);

export const selectTowerById = (id: string) => createSelector(selectTowersState, (towers) => towers[id]);

export const selectTowersByOwnerId = (ownerId: string) =>
	createSelector(selectTowersState, (towers) => {
		const ownerTowers: TowerEntity[] = [];

		for (const [, tower] of Object.entries(towers)) {
			if (tower && tower.ownerId === ownerId) {
				ownerTowers.push(tower);
			}
		}
		return ownerTowers;
	});

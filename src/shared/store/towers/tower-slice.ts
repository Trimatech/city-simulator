import { createProducer } from "@rbxts/reflex";
import { assign, mapProperties, mapProperty } from "shared/utils/object-utils";

export interface TowerState {
	readonly [id: string]: TowerEntity | undefined;
}

export interface TowerEntity {
	readonly id: string;
	readonly position: Vector2;
	readonly ownerId: string; // ID of the player who placed the tower
	readonly range: number;
	readonly damage: number;
	readonly lastAttackTime: number;
}

const initialState: TowerState = {};

export const towerSlice = createProducer(initialState, {
	placeTower: (state, tower: TowerEntity) => {
		return assign(state, { [tower.id]: tower });
	},

	removeTower: (state, id: string) => {
		return mapProperty(state, id, () => undefined);
	},

	updateTowerLastAttack: (state, id: string, lastAttackTime: number) => {
		return mapProperty(state, id, (tower) => ({
			...tower,
			lastAttackTime,
		}));
	},

	removeTowersByOwnerId: (state, ownerId: string) => {
		return mapProperties(state, (tower) => {
			if (tower.ownerId === ownerId) {
				return undefined;
			}
			return tower;
		});
	},
});

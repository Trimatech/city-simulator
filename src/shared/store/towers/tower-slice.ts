import { createProducer } from "@rbxts/reflex";
import { assign, mapProperties, mapProperty } from "shared/utils/object-utils";

export interface TowerState {
	readonly [id: string]: TowerEntity | undefined;
}

export interface TowerEntity {
	readonly id: string;
	readonly position: Vector2;
	readonly ownerId: string;
	readonly range: number;
	readonly damage: number;
	readonly lastAttackTime: number;
	readonly lastAttackPlayerName: string | undefined;
	readonly currentTargetId?: string;
	readonly hasEnemyInRange: boolean;
}

const initialState: TowerState = {};

export const towerSlice = createProducer(initialState, {
	placeTower: (state, tower: TowerEntity) => {
		return assign(state, { [tower.id]: tower });
	},

	removeTower: (state, id: string) => {
		return mapProperty(state, id, () => undefined);
	},

	updateTowerLastAttack: (state, id: string, props: Partial<TowerEntity>) => {
		return mapProperty(state, id, (tower) => ({
			...tower,
			...props,
		}));
	},

	updateTowerTarget: (
		state,
		id: string,
		props: Pick<
			Partial<TowerEntity>,
			"currentTargetId" | "hasEnemyInRange" | "lastAttackTime" | "lastAttackPlayerName"
		>,
	) => {
		print("updateTowerTarget.....", id, props);
		return mapProperty(state, id, (tower) => {
			const nextS = {
				...tower,
				...props,
			};

			// When no enemies are in range, explicitly clear the current target.
			// Note: roblox-ts omits fields set to undefined from object literals at runtime,
			// so we cannot rely on `currentTargetId: undefined` being present in `props`.
			if (props.hasEnemyInRange === false) {
				nextS.currentTargetId = undefined;
			}

			return nextS;
		});
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

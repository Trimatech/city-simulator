import { Workspace } from "@rbxts/services";
import { store } from "server/store";
import { getPlayerHumanoidByName } from "server/world/world.utils";
import {
	SOLDIER_BOOST_MULTIPLIER,
	SOLDIER_ENEMY_TERRITORY_MULTIPLIER,
	SOLDIER_OWN_TERRITORY_MULTIPLIER,
	SOLDIER_SPEED,
} from "shared/constants/core";
import { selectSoldierById } from "shared/store/soldiers";

export function setSoldierSpeed(name: string, speed: number) {
	const humanoid = getPlayerHumanoidByName(name);
	if (humanoid) {
		humanoid.WalkSpeed = speed;
	}
}

export function getEffectiveSpeed(soldierId: string, isInside: boolean, isInEnemyTerritory: boolean): number {
	const soldier = store.getState(selectSoldierById(soldierId));
	const isTurboActive = soldier !== undefined && soldier.turboActiveUntil > Workspace.GetServerTimeNow();

	let speed = SOLDIER_SPEED;

	if (isInside) {
		speed *= SOLDIER_OWN_TERRITORY_MULTIPLIER;
	} else if (isInEnemyTerritory) {
		speed *= SOLDIER_ENEMY_TERRITORY_MULTIPLIER;
	}

	if (isTurboActive) {
		speed *= SOLDIER_BOOST_MULTIPLIER;
	}

	return speed;
}

export function applySoldierTerritorySpeed(soldierId: string, isInside: boolean, isInEnemyTerritory: boolean) {
	const speed = getEffectiveSpeed(soldierId, isInside, isInEnemyTerritory);
	setSoldierSpeed(soldierId, speed);
}

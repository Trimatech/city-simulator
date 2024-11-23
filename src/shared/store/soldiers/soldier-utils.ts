import { SoldierEntity } from "./soldier-slice";

export function soldierIsBoosting(soldier: SoldierEntity) {
	return soldier.boost && soldier.orbs > 10;
}

export const SOLDIER_RADIUS_BASE = 0.5;

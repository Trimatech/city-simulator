import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { HEALTH_REGEN_AMOUNT, HEALTH_REGEN_INTERVAL, WORLD_TICK } from "shared/constants/core";
import { selectSoldiersById } from "shared/store/soldiers";

import { updateSoldierGrid } from "./soldier-grid";

const nextSoldierInputs = new Map<string, Vector2>();

let regenTimer = 0;

export function onSoldierTick(dt = WORLD_TICK) {
	consumeNextSoldierInputs();
	store.soldierTick();

	regenTimer += dt;
	if (regenTimer >= HEALTH_REGEN_INTERVAL) {
		regenTimer = 0;
		regenHealth();
	}

	updateSoldierGrid(); //
	//	updateSoldierGridVisualization();
}

function regenHealth() {
	const soldiers = store.getState(selectSoldiersById);

	for (const [, soldier] of Object.entries(soldiers)) {
		if (!soldier || soldier.dead || soldier.health >= soldier.maxHealth) continue;
		store.setSoldierHealth(soldier.id, soldier.health + HEALTH_REGEN_AMOUNT);
	}
}

export function registerSoldierInput(id: string, position: Vector2) {
	const prevPosition = nextSoldierInputs.get(id);
	if (prevPosition !== undefined && prevPosition.sub(position).Magnitude < 0.001) {
		warn(`Soldier ${id} input is the same as the previous input, skipping`);
		return;
	}

	nextSoldierInputs.set(id, position);
}

export function deleteSoldierInput(id: string) {
	nextSoldierInputs.delete(id);
}

function consumeNextSoldierInputs() {
	for (const [id, position] of nextSoldierInputs) {
		store.moveSoldier(id, position);
	}

	nextSoldierInputs.clear();
}

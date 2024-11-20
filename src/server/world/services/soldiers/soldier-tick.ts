import { store } from "server/store";

import { updateSoldierGrid } from "./soldier-grid";

const nextSoldierInputs = new Map<string, Vector2>();

export function onSoldierTick() {
	consumeNextSoldierInputs();
	store.soldierTick();
	updateSoldierGrid(); //
}

export function registerSoldierInput(id: string, position: Vector2) {
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

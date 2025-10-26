import { store } from "server/store";

import { updateSoldierGrid } from "./soldier-grid";

const nextSoldierInputs = new Map<string, Vector2>();

export function onSoldierTick() {
	consumeNextSoldierInputs();
	store.soldierTick();
	updateSoldierGrid(); //
	//	updateSoldierGridVisualization();
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

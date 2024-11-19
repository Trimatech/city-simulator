import { store } from "server/store";

import { updateSnakeGrid } from "./snake-grid";

const nextSnakeInputs = new Map<string, Vector2>();

export function onSnakeTick() {
	consumeNextSnakeInputs();
	store.snakeTick();
	updateSnakeGrid(); //
}

export function registerSnakeInput(id: string, position: Vector2) {
	nextSnakeInputs.set(id, position);
}

export function deleteSnakeInput(id: string) {
	nextSnakeInputs.delete(id);
}

function consumeNextSnakeInputs() {
	for (const [id, position] of nextSnakeInputs) {
		store.moveSnake(id, position);
	}

	nextSnakeInputs.clear();
}

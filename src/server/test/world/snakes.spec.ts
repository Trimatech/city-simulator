/// <reference types="@rbxts/testez/globals" />

import { store } from "server/store";
import { getSnake, onSnakeTick } from "server/world";

export = () => {
	it("should update snake boost", () => {
		store.addSnake("__test__");
		store.boostSnake("__test__", true);
		expect(getSnake("__test__")?.boost).to.equal(true);
	});

	it("should step snake physics", () => {
		store.addSnake("__test__");
		onSnakeTick();
		const snake = getSnake("__test__")!;
		expect(snake.position).to.never.equal(Vector2.zero);
		expect(snake.tracers.size()).to.never.equal(0);
	});

	it("should not move dead snakes", () => {
		store.addSnake("__test__", { dead: true });
		onSnakeTick();
		const initialSnake = getSnake("__test__")!;
		onSnakeTick();
		const finalSnake = getSnake("__test__")!;
		expect(initialSnake.position).to.equal(finalSnake.position);
	});
};

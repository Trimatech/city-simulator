import { useInterval, useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { useInputDevice, useStore } from "client/hooks";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalSnake } from "shared/store/snakes";

import { useToggleTouchControls } from "./utils/use-toggle-touch-controls";

const TICK = 1;

export function Controller() {
	const store = useStore();
	const device = useInputDevice();
	const snake = useSelector(selectLocalSnake);

	useToggleTouchControls(snake !== undefined);

	useInterval(() => {
		const position = Players.LocalPlayer.Character?.PrimaryPart?.Position;
		if (position) {
			const vector2 = new Vector2(position.X, position.Z);
			remotes.snake.move.fire(vector2);
		}
	}, TICK);

	const setBoost = useThrottleCallback(
		(boost: boolean) => {
			remotes.snake.boost.fire(boost);
		},
		{ wait: WORLD_TICK, leading: true, trailing: true },
	);

	useEffect(() => {
		if (snake) {
			store.setWorldInputAngle(0);
		}
	}, [!snake]);

	if (!snake) {
		return <></>;
	}

	return <></>;
}

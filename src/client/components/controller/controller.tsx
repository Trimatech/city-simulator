import { useInterval, useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { useInputDevice, useStore } from "client/hooks";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalSoldier } from "shared/store/soldiers";

import { useToggleTouchControls } from "./utils/use-toggle-touch-controls";

export function Controller() {
	const store = useStore();
	const device = useInputDevice();
	const soldier = useSelector(selectLocalSoldier);

	useToggleTouchControls(soldier !== undefined);

	useInterval(() => {
		const position = Players.LocalPlayer.Character?.PrimaryPart?.Position;
		if (position) {
			const vector2 = new Vector2(position.X, position.Z);
			remotes.soldier.move.fire(vector2);
		}
	}, WORLD_TICK);

	const setBoost = useThrottleCallback(
		(boost: boolean) => {
			remotes.soldier.boost.fire(boost);
		},
		{ wait: WORLD_TICK, leading: true, trailing: true },
	);

	useEffect(() => {
		if (soldier) {
			store.setWorldInputAngle(0);
		}
	}, [!soldier]);

	if (!soldier) {
		return <></>;
	}

	return <></>;
}

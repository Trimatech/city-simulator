import { useInterval } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalIsSpawned } from "shared/store/soldiers";

export function Controller() {
	const isSpawned = useSelector(selectLocalIsSpawned);

	useInterval(() => {
		if (!isSpawned) return;
		const position = Players.LocalPlayer?.Character?.PrimaryPart?.Position;
		if (position) {
			const vector2 = new Vector2(position.X, position.Z);
			remotes.soldier.move.fire(vector2);
		}
	}, WORLD_TICK);

	return <></>;
}

import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { useStore } from "client/hooks";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalSoldier } from "shared/store/soldiers";

export function Controller() {
	const store = useStore();
	const soldier = useSelector(selectLocalSoldier);

	const isSpawned = soldier !== undefined && !soldier.dead;

	useInterval(() => {
		if (!isSpawned) return;
		const position = Players.LocalPlayer?.Character?.PrimaryPart?.Position;
		if (position) {
			const vector2 = new Vector2(position.X, position.Z);
			remotes.soldier.move.fire(vector2);
		}
	}, WORLD_TICK);

	useEffect(() => {
		if (soldier) {
			store.setWorldInputAngle(0);
		}
	}, [!soldier]);

	return <></>;
}

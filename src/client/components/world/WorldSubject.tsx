import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { cycleNextSoldier, selectLocalSoldierId } from "shared/store/soldiers";

export function WorldSubject() {
	const store = useStore();
	const soldierClientId = useSelector(selectLocalSoldierId);
	const soldierSpectatedId = useSelector(selectLocalSoldierId);

	useEffect(() => {
		if (soldierClientId) {
			store.setWorldSubject(soldierClientId);
		} else if (soldierSpectatedId) {
			store.setWorldSubject(soldierSpectatedId);
		}
	}, [soldierClientId, soldierSpectatedId]);

	useInterval(() => {
		if (!soldierSpectatedId) {
			store.setWorldSpectating(store.getState(cycleNextSoldier("")));
		}
	}, 1);

	return <></>;
}

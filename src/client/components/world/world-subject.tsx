import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { selectSoldierspectated } from "client/store/world";
import { cycleNextSoldier, selectLocalSoldier } from "shared/store/soldiers";

export function WorldSubject() {
	const store = useStore();
	const soldierClient = useSelector(selectLocalSoldier);
	const soldierspectated = useSelector(selectSoldierspectated);

	useEffect(() => {
		if (soldierClient) {
			store.setWorldSubject(soldierClient.id);
		} else if (soldierspectated) {
			store.setWorldSubject(soldierspectated.id);
		}
	}, [soldierClient?.id, soldierspectated?.id]);

	useInterval(() => {
		if (!soldierspectated) {
			store.setWorldSpectating(store.getState(cycleNextSoldier("")));
		}
	}, 1);

	return <></>;
}

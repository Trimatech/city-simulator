import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useMotion } from "client/hooks";
import { selectWorldSubject } from "client/store/world";
import { selectHasLocalSoldier } from "shared/store/soldiers";

import { Transition } from "../ui/transition";
import { Compass } from "./compass";
import { Minimap } from "./minimap";
import { RightSide } from "./right/RightSide";

export function Game() {
	const spawned = useSelector(selectHasLocalSoldier);
	const inGame = useSelector(selectWorldSubject) !== undefined;
	const [transition, transitionMotion] = useMotion(0);

	useEffect(() => {
		transitionMotion.spring(inGame ? 1 : 0);
	}, [inGame]);

	if (!spawned) {
		return undefined;
	}

	return (
		<Transition groupTransparency={lerpBinding(transition, 1, 0)} size={new UDim2(1, 0, 1, 0)}>
			<Minimap />
			<Compass />
			<RightSide />
		</Transition>
	);
}

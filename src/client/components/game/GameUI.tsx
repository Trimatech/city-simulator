import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useMotion } from "client/hooks";
import { selectWorldSubject } from "client/store/world";
import { SlideIn } from "client/ui/slide-in";

import { Transition } from "../../ui/transition";
import { Stats } from "../stats/Stats";
import { Compass } from "./compass";
import { HealthView } from "./health/HealthView";
import { Minimap } from "./minimap/Minimap2";
import { RightSide } from "./right/RightSide";

interface GameUIProps {
	visible: boolean;
}

export function GameUI({ visible }: GameUIProps) {
	const inGame = useSelector(selectWorldSubject) !== undefined;
	const [transition, transitionMotion] = useMotion(0);

	useEffect(() => {
		transitionMotion.spring(inGame ? 1 : 0);
	}, [inGame]);

	return (
		<Transition groupTransparency={lerpBinding(transition, 1, 0)} size={new UDim2(1, 0, 1, 0)}>
			<SlideIn visible={visible} direction="left">
				<HealthView />
				<Stats />
			</SlideIn>
			<SlideIn visible={visible} direction="right">
				<Minimap />
				<RightSide />
			</SlideIn>
			<Compass />
		</Transition>
	);
}

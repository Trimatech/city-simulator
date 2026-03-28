import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Transition } from "@rbxts-ui/layout";
import { useIsMobile, useMotion } from "client/hooks";
import { selectWorldSubject } from "client/store/world";

import { GameUIDesktop } from "./GameUIDesktop";
import { GameUIMobile } from "./GameUIMobile";

interface GameUIProps {
	visible: boolean;
}

export function GameUI({ visible }: GameUIProps) {
	const inGame = useSelector(selectWorldSubject) !== undefined;
	const isMobile = useIsMobile();
	const [transition, transitionMotion] = useMotion(0);

	useEffect(() => {
		transitionMotion.spring(inGame ? 1 : 0);
	}, [inGame]);

	return (
		<Transition groupTransparency={lerpBinding(transition, 1, 0)} size={new UDim2(1, 0, 1, 0)}>
			{isMobile ? <GameUIMobile visible={visible} /> : <GameUIDesktop visible={visible} />}
		</Transition>
	);
}

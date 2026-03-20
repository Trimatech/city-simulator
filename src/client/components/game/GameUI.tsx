import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Transition, VStack } from "@rbxts-ui/layout";
import { useMotion } from "client/hooks";
import { selectWorldSubject } from "client/store/world";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";

import { Stats } from "../stats/Stats";
import { Compass } from "./compass";
import { HealthView } from "./health/HealthView";
import { MinimapArea } from "./minimap/MinimapArea";
import { PowerupsPanel } from "./right/powerups/PowerupsPanel";

interface GameUIProps {
	visible: boolean;
}

export function GameUI({ visible }: GameUIProps) {
	const rem = useRem();
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
				<VStack
					size={UDim2.fromScale(1, 1)}
					verticalAlignment={Enum.VerticalAlignment.Bottom}
					horizontalAlignment={Enum.HorizontalAlignment.Right}
					padding={rem(3)}
					spacing={rem(3)}
				>
					<PowerupsPanel />
					<MinimapArea />
				</VStack>
			</SlideIn>
			<Compass />
		</Transition>
	);
}

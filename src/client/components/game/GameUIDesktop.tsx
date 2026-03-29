import React from "@rbxts/react";
import { VFill, VStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import { outerPaddingRem } from "shared/constants/sizes";

import { Stats } from "../stats/Stats";
import { MilestoneWidget } from "./milestones/MilestoneWidget";
import { MinimapArea } from "./minimap/MinimapArea";
import { PowerupsPanel } from "./right/powerups/PowerupsPanel";
import { TutorialHints } from "./TutorialHints";
import { WinnerDirection } from "./WinnerDirection/WinnerDirection";

interface GameUIDesktopProps {
	visible: boolean;
}

export function GameUIDesktop({ visible }: GameUIDesktopProps) {
	const rem = useRem();

	return (
		<>
			<SlideIn visible={visible} direction="left">
				<VStack size={UDim2.fromScale(1, 1)} spacing={rem(1)} padding={rem(outerPaddingRem)}>
					<MilestoneWidget />
					<VFill />
					<Stats />
				</VStack>
			</SlideIn>
			<SlideIn visible={visible} direction="right">
				<VStack
					size={UDim2.fromScale(1, 1)}
					verticalAlignment={Enum.VerticalAlignment.Bottom}
					horizontalAlignment={Enum.HorizontalAlignment.Right}
					padding={rem(outerPaddingRem)}
					spacing={rem(3)}
				>
					<PowerupsPanel visible={visible} />
					<MinimapArea />
				</VStack>
			</SlideIn>
			<WinnerDirection />
			<TutorialHints />
		</>
	);
}

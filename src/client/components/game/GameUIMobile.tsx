import React from "@rbxts/react";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Group } from "@rbxts-ui/primitives";
import { RemProvider } from "client/ui/rem/RemProvider";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import { outerPaddingRemMobile } from "shared/constants/sizes";

import { Compass } from "./compass";
import { MilestoneWidget } from "./milestones/MilestoneWidget";
import { MinimapArea } from "./minimap/MinimapArea";
import { PowerupsPanelHorizontal } from "./right/powerups/PowerupsPanelHorizontal";
import { TutorialHints } from "./TutorialHints";

const MINIMUM_POWERUPS_PANEL_REM = 10;

interface GameUIMobileProps {
	visible: boolean;
}

export function GameUIMobile({ visible }: GameUIMobileProps) {
	const rem = useRem();

	return (
		<>
			{/* Left side: milestones */}
			<SlideIn visible={visible} direction="left">
				<VStack size={UDim2.fromScale(1, 1)} spacing={rem(1)} padding={rem(outerPaddingRemMobile)}>
					<MilestoneWidget />
				</VStack>
			</SlideIn>

			{/* Right side: minimap */}
			<SlideIn visible={visible} direction="right">
				<Group size={UDim2.fromScale(1, 1)} anchorPoint={new Vector2(1, 0)} position={UDim2.fromScale(1, 0)}>
					<HStack
						size={UDim2.fromScale(1, 1)}
						horizontalAlignment={Enum.HorizontalAlignment.Right}
						verticalAlignment={Enum.VerticalAlignment.Top}
						padding={rem(outerPaddingRemMobile)}
					>
						<MinimapArea />
					</HStack>
				</Group>
			</SlideIn>

			{/* Bottom center: horizontal powerups */}
			<SlideIn visible={visible} direction="bottom">
				<HStack
					size={UDim2.fromScale(1, 1)}
					horizontalAlignment={Enum.HorizontalAlignment.Center}
					verticalAlignment={Enum.VerticalAlignment.Bottom}
					padding={rem(outerPaddingRemMobile)}
				>
					<RemProvider minimumRem={MINIMUM_POWERUPS_PANEL_REM}>
						<PowerupsPanelHorizontal visible={visible} />
					</RemProvider>
				</HStack>
			</SlideIn>

			<Compass />
			<TutorialHints />
		</>
	);
}

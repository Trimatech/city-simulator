import React from "@rbxts/react";
import { VStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { GameWindow } from "client/components/menu/shop/GameWindow";
import { GameWindowTitleHeader } from "client/components/menu/shop/GameWindowTitleHeader";
import { useRem } from "client/ui/rem/useRem";
import { SCROLLBAR_COLOR, SCROLLBAR_THICKNESS, SCROLLBAR_TRANSPARENCY } from "client/ui/scrollbar.constants";

import { BadgeTargets } from "./components/BadgeTargets";
import { LifetimeMilestones } from "./components/LifetimeMilestones";

interface ProgressWindowProps {
	readonly onClose: () => void;
}

export function ProgressWindow({ onClose }: ProgressWindowProps) {
	const rem = useRem();

	return (
		<GameWindow header={<GameWindowTitleHeader title="PROGRESS" onClose={onClose} />} variant="progress">
			<Frame size={new UDim2(1, 0, 0, rem(37))} backgroundTransparency={1}>
				<scrollingframe
					BackgroundTransparency={1}
					BorderSizePixel={0}
					Size={new UDim2(1, 0, 1, 0)}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					ScrollBarThickness={rem(SCROLLBAR_THICKNESS)}
					ScrollingDirection={Enum.ScrollingDirection.Y}
					ScrollBarImageColor3={SCROLLBAR_COLOR}
					ScrollBarImageTransparency={SCROLLBAR_TRANSPARENCY}
				>
					<Frame
						size={new UDim2(1, rem(0.4), 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
						backgroundTransparency={1}
					>
						<uipadding
							PaddingTop={new UDim(0, rem(1.4))}
							PaddingBottom={new UDim(0, rem(2.2))}
							PaddingLeft={new UDim(0, rem(1.4))}
							PaddingRight={new UDim(0, rem(2))}
						/>
						<VStack
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
							spacing={rem(1.5)}
							horizontalAlignment={Enum.HorizontalAlignment.Left}
						>
							<LifetimeMilestones />

							<BadgeTargets />
						</VStack>
					</Frame>
				</scrollingframe>
			</Frame>
		</GameWindow>
	);
}

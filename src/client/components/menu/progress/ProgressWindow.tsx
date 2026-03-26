import React from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { VStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { GameWindow } from "client/components/menu/shop/GameWindow";
import { GameWindowTitleHeader } from "client/components/menu/shop/GameWindowTitleHeader";
import { useRem } from "client/ui/rem/useRem";
import { SCROLLBAR_COLOR, SCROLLBAR_THICKNESS, SCROLLBAR_TRANSPARENCY } from "client/ui/scrollbar.constants";
import { formatInteger } from "client/utils/format-integer";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { allWallSkins } from "shared/constants/skins";
import { selectPlayerBalance } from "shared/store/saves";

import { BadgeTargets } from "./components/BadgeTargets";
import { LifetimeMilestones } from "./components/LifetimeMilestones";
import { ProgressCardItem } from "./components/ProgressCardItem";
import { QUEST_TARGETS } from "./constants";

interface ProgressWindowProps {
	readonly onClose: () => void;
}

function getNextSkin(ownedSkins: readonly string[]) {
	let cheapest = allWallSkins.find((skin) => skin.price > 0 && !ownedSkins.includes(skin.id));

	for (const skin of allWallSkins) {
		if (skin.price <= 0 || ownedSkins.includes(skin.id)) {
			continue;
		}

		if (cheapest === undefined || skin.price < cheapest.price) {
			cheapest = skin;
		}
	}

	return cheapest;
}

export function ProgressWindow({ onClose }: ProgressWindowProps) {
	const rem = useRem();
	const balance = useSelectorCreator(selectPlayerBalance, USER_NAME) ?? 0;

	const questIcons: Record<string, string> = {
		area: assets.ui.icons.area,
		eliminations: assets.ui.icons.kills,
		orbs: assets.ui.icons.orb,
	};

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
							{QUEST_TARGETS.map((quest, index) => (
								<ProgressCardItem
									key={quest.id}
									title={quest.title}
									valueText={`0/${formatInteger(quest.target)}`}
									icon={questIcons[quest.id]}
									progress={0}
									progressLabel="0%"
									accent={palette.blue}
								/>
							))}

							<LifetimeMilestones />

							<BadgeTargets />
						</VStack>
					</Frame>
				</scrollingframe>
			</Frame>
		</GameWindow>
	);
}

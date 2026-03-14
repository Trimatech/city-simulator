import React, { useEffect, useState } from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { SCROLLBAR_COLOR, SCROLLBAR_THICKNESS, SCROLLBAR_TRANSPARENCY } from "client/ui/scrollbar.constants";
import assets from "shared/assets";
import { DAILY_REWARD_CYCLE, getDailyRewardAmount } from "shared/constants/daily-rewards";
import { remotes } from "shared/remotes";

import { MainButton, ShopButtonText } from "../../../ui/MainButton";
import { GameWindow } from "../shop/GameWindow";
import { GameWindowTitleHeader } from "../shop/GameWindowTitleHeader";
import { DailyRewardItem } from "./DailyRewardItem";

interface DailyRewardScreenProps {
	readonly streakDay: number;
	readonly onDismiss: () => void;
}

/**
 * Maps a crystal reward amount to the appropriate crystal icon asset.
 */
function getCrystalIcon(reward: number): string {
	if (reward <= 1) return assets.ui.crystals.crystals_1;
	if (reward <= 2) return assets.ui.crystals.crystals_2;
	if (reward <= 5) return assets.ui.crystals.crystals_5;
	if (reward <= 7) return assets.ui.crystals.crystals_15;
	return assets.ui.crystals.crystals_25;
}

export function DailyRewardScreen({ streakDay: _streakDay, onDismiss }: DailyRewardScreenProps) {
	const rem = useRem();
	const [claimed, setClaimed] = useState(false);

	useEffect(() => {
		if (claimed) {
			const thread = task.delay(1, () => onDismiss());
			return () => task.cancel(thread);
		}
	}, [claimed]);

	const handleClaim = () => {
		if (claimed) return;
		setClaimed(true);
		remotes.dailyReward.claim.fire();
	};

	const rewardItems: React.Element[] = [];
	for (let i = 1; i <= DAILY_REWARD_CYCLE; i++) {
		const reward = getDailyRewardAmount(i);
		rewardItems.push(
			<DailyRewardItem
				key={`day-${i}`}
				title={`DAY ${i}`}
				label={reward === 1 ? `${reward} Crystal` : `${reward} Crystals`}
				icon={getCrystalIcon(reward)}
				layoutOrder={i}
			/>,
		);
	}

	return (
		<GameWindow header={<GameWindowTitleHeader title="DAILY REWARDS" onClose={onDismiss} />}>
			<Frame
				backgroundTransparency={1}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				name="DailyRewardScreenContent"
			>
				<scrollingframe
					BackgroundTransparency={1}
					BorderSizePixel={0}
					Size={new UDim2(1, 0, 1, 0)}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					AutomaticCanvasSize={Enum.AutomaticSize.X}
					ScrollBarThickness={rem(SCROLLBAR_THICKNESS)}
					ScrollingDirection={Enum.ScrollingDirection.X}
					ScrollBarImageColor3={SCROLLBAR_COLOR}
					ScrollBarImageTransparency={SCROLLBAR_TRANSPARENCY}
					ClipsDescendants={true}
					AutomaticSize={Enum.AutomaticSize.Y}
				>
					<uipadding PaddingBottom={new UDim(0, rem(6))} />
					<HStack
						spacing={rem(1.5)}
						horizontalAlignment={Enum.HorizontalAlignment.Left}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
						layoutOrder={1}
						padding={rem(1.3)}
					>
						{rewardItems}
					</HStack>
				</scrollingframe>
				<Frame
					size={new UDim2(0, 0, 0, 0)}
					position={new UDim2(0.5, 0, 1, -rem(5.7))}
					anchorPoint={new Vector2(0.5, 1)}
					automaticSize={Enum.AutomaticSize.X}
				>
					<MainButton onClick={handleClaim} size={new UDim2(0, rem(22), 0, rem(4.5))} layoutOrder={2}>
						<ShopButtonText text={claimed ? "CLAIMED!" : "CLAIM REWARD"} />
					</MainButton>
				</Frame>
			</Frame>
		</GameWindow>
	);
}

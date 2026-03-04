import React, { useEffect, useState } from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { BgWindow } from "client/ui/BgWindow";
import { Image } from "client/ui/image";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import assets from "shared/assets";
import { DAILY_REWARD_CYCLE, getDailyRewardAmount } from "shared/constants/daily-rewards";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

import { DayIndicator } from "./DayIndicator";

interface DailyRewardScreenProps {
	readonly streakDay: number;
	readonly crystalAmount: number;
	readonly onDismiss: () => void;
}

export function DailyRewardScreen({ streakDay, crystalAmount, onDismiss }: DailyRewardScreenProps) {
	const rem = useRem();
	const [claimed, setClaimed] = useState(false);
	const [position, positionMotion] = useMotion(new UDim2(0.5, 0, 2.5, 0));

	useEffect(() => {
		positionMotion.spring(new UDim2(0.5, 0, 0.5, 0), springs.responsive);
	}, []);

	useEffect(() => {
		if (claimed) {
			positionMotion.spring(new UDim2(0.5, 0, 2.5, 0), springs.responsive);
			const thread = task.delay(1, () => onDismiss());
			return () => task.cancel(thread);
		}
	}, [claimed]);

	const handleClaim = () => {
		if (claimed) return;
		setClaimed(true);
		remotes.dailyReward.claim.fire();
	};

	const dayIndicators: React.Element[] = [];
	for (let i = 1; i <= DAILY_REWARD_CYCLE; i++) {
		dayIndicators.push(
			<DayIndicator
				key={`day-${i}`}
				day={i}
				isCurrentDay={i === streakDay}
				isPastDay={i < streakDay}
				reward={getDailyRewardAmount(i)}
			/>,
		);
	}

	return (
		<BgWindow image={assets.ui.diagonal_stripes} accentColor={palette.yellow} position={position}>
			<Text
				font={fonts.mplus.bold}
				text="Daily Reward"
				automaticSize={Enum.AutomaticSize.XY}
				textColor={palette.yellow}
				textSize={rem(5)}
			>
				<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.3)} />
			</Text>

			<HStack
				spacing={rem(0.75)}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
				automaticSize={Enum.AutomaticSize.XY}
				size={new UDim2(0, 0, 0, 0)}
				layoutOrder={1}
			>
				{dayIndicators}
			</HStack>

			<VStack
				spacing={rem(1)}
				layoutOrder={2}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				<HStack
					size={new UDim2(1, 0, 0, 0)}
					horizontalAlignment={Enum.HorizontalAlignment.Center}
					automaticSize={Enum.AutomaticSize.Y}
				>
					<Text
						font={fonts.inter.bold}
						text={`+${crystalAmount}`}
						textColor={palette.sapphire}
						textSize={rem(3)}
						automaticSize={Enum.AutomaticSize.XY}
					/>
					<Image
						image={assets.ui.shards_icon_color}
						size={new UDim2(0, rem(3), 0, rem(3.5))}
						scaleType="Crop"
					/>
				</HStack>

				<PrimaryButton
					onClick={handleClaim}
					primaryColor={palette.green}
					enabled={!claimed}
					size={new UDim2(0, rem(18), 0, rem(4))}
				>
					<Text
						font={fonts.inter.medium}
						text={claimed ? "Claimed!" : "Claim Reward"}
						textColor={palette.base}
						textSize={rem(2)}
						size={new UDim2(1, 0, 1, 0)}
					/>
				</PrimaryButton>
			</VStack>
		</BgWindow>
	);
}

import React, { useState } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { HomeStats } from "client/components/stats/HomeStats";
import { fonts } from "client/constants/fonts";
import { MainButton } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import { USER_NAME } from "shared/constants/core";
import {
	DAILY_REWARD_CYCLE,
	DAILY_STREAK_WINDOW,
	SECONDS_PER_DAY,
} from "shared/constants/daily-rewards";
import { palette } from "shared/constants/palette";
import { ROOT_PADDING } from "shared/constants/theme";
import { selectPlayerDailyStreak, selectPlayerLastDailyRewardClaim } from "shared/store/saves";

import { DailyRewardScreen } from "../daily-reward/DailyRewardScreen";
import { ShopWindow } from "../shop/ShopWindow";
import { GameVersion } from "./GameVersion";
import { MuteButton } from "./MuteButton";
import { PlayButton } from "./PlayButton";

interface DailyRewardInfo {
	readonly streakDay: number;
}

interface HomeProps {
	visible: boolean;
}

export function Home({ visible }: HomeProps) {
	const rem = useRem();
	const [isShopOpen, setIsShopOpen] = useState(false);
	const [dailyReward, setDailyReward] = useState<DailyRewardInfo | undefined>();
	const currentStreak = useSelectorCreator(selectPlayerDailyStreak, USER_NAME);
	const lastClaim = useSelectorCreator(selectPlayerLastDailyRewardClaim, USER_NAME);

	const openDailyReward = () => {
		const now = os.time();
		const elapsed = now - lastClaim;

		let streakDay: number;
		if (lastClaim === 0 || elapsed >= DAILY_STREAK_WINDOW) {
			streakDay = 1;
		} else if (elapsed >= SECONDS_PER_DAY) {
			streakDay = (currentStreak % DAILY_REWARD_CYCLE) + 1;
		} else {
			streakDay = currentStreak;
		}

		setDailyReward({ streakDay });
	};

	return (
		<>
			<SlideIn visible={visible} direction="left">
				<HStack
					position={new UDim2(0, rem(ROOT_PADDING), 0, rem(ROOT_PADDING) + rem(4))}
					verticalAlignment={Enum.VerticalAlignment.Top}
					spacing={rem(1)}
				>
					<MainButton onClick={() => setIsShopOpen(true)} size={new UDim2(0, rem(10), 0, rem(4))}>
						<Text
							font={fonts.inter.medium}
							text={"🛒 Shop"}
							textSize={rem(1.6)}
							size={new UDim2(1, 0, 1, 0)}
						/>
					</MainButton>
					<MainButton
						onClick={openDailyReward}
						primaryColor={palette.yellow}
						size={new UDim2(0, rem(13), 0, rem(4))}
					>
						<Text
							font={fonts.inter.medium}
							text={"🎁 Daily Reward"}
							textSize={rem(1.6)}
							size={new UDim2(1, 0, 1, 0)}
						/>
					</MainButton>
				</HStack>
			</SlideIn>

			<SlideIn visible={visible} direction="right">
				<Frame
					anchorPoint={new Vector2(1, 1)}
					size={new UDim2()}
					position={new UDim2(1, rem(-ROOT_PADDING), 1, rem(-ROOT_PADDING))}
				>
					<uilistlayout
						Padding={new UDim(0, rem(1))}
						VerticalAlignment="Bottom"
						HorizontalAlignment="Right"
						FillDirection="Horizontal"
					/>
					<MuteButton />
				</Frame>
			</SlideIn>

			<SlideIn visible={visible} direction="bottom">
				<PlayButton
					anchorPoint={new Vector2(0.5, 0.5)}
					size={new UDim2(0, rem(18), 0, rem(4.5))}
					position={new UDim2(0.5, 0, 1, -rem(5.5))}
				/>
				<GameVersion />

				<HStack
					anchorPoint={new Vector2(0, 1)}
					size={new UDim2(1, 0, 0, rem(10))}
					position={new UDim2(0, 0, 1, 0)}
					verticalAlignment={Enum.VerticalAlignment.Bottom}
				>
					<HomeStats />
				</HStack>
			</SlideIn>

			{isShopOpen && (
				<>
					<ReactiveButton2
						onClick={() => setIsShopOpen(false)}
						backgroundTransparency={0.2}
						backgroundColor={palette.teal}
						size={new UDim2(1, 0, 1, 0)}
						position={new UDim2(0, 0, 0, 0)}
					/>

					<ShopWindow onClose={() => setIsShopOpen(false)} />
				</>
			)}

			{dailyReward && (
				<DailyRewardScreen streakDay={dailyReward.streakDay} onDismiss={() => setDailyReward(undefined)} />
			)}
		</>
	);
}

import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, InferFusionProps, Number } from "@rbxts/ui-labs";
import { DailyRewardScreen } from "client/components/menu/daily-reward/DailyRewardScreen";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { SECONDS_PER_DAY } from "shared/constants/daily-rewards";
import { defaultPlayerSave } from "shared/store/saves/save-types";

const controls = {
	streakDay: Number(1, 1, 7, 1),
	claimState: Choose(["Claimable", "Already claimed today", "Never claimed"]),
};

interface StoryContentProps {
	streakDay: number;
	claimState: string;
}

function StoryContent({ streakDay, claimState }: StoryContentProps) {
	useEffect(() => {
		let dailyStreak: number;
		let lastDailyRewardClaim: number;

		if (claimState === "Never claimed") {
			dailyStreak = 0;
			lastDailyRewardClaim = 0;
		} else if (claimState === "Claimable") {
			dailyStreak = streakDay - 1;
			lastDailyRewardClaim = os.time() - SECONDS_PER_DAY;
		} else {
			dailyStreak = streakDay;
			lastDailyRewardClaim = os.time();
		}

		store.setPlayerSave(USER_NAME, { ...defaultPlayerSave, dailyStreak, lastDailyRewardClaim });
	}, [streakDay, claimState]);

	return <DailyRewardScreen onDismiss={() => {}} />;
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { streakDay, claimState } = props.controls;
		return (
			<RootProvider>
				<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
					<StoryContent streakDay={streakDay as number} claimState={claimState as string} />
				</frame>
			</RootProvider>
		);
	},
};

export = story;

import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { DailyRewardScreen } from "client/components/menu/daily-reward/DailyRewardScreen";
import { RootProvider } from "client/providers/root-provider";
import { getDailyRewardAmount } from "shared/constants/daily-rewards";

const controls = {
	streakDay: Number(1, 1, 7, 1),
};

interface StoryProps {
	streakDay: number;
}

function DailyRewardScreenStoryContent({ streakDay }: StoryProps) {
	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
				<DailyRewardScreen
					streakDay={streakDay}
					crystalAmount={getDailyRewardAmount(streakDay)}
					onDismiss={() => {}}
				/>
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { streakDay } = props.controls;
		return <DailyRewardScreenStoryContent streakDay={streakDay as number} />;
	},
};

export = story;

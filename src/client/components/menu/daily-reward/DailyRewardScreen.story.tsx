import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, InferFusionProps, Number } from "@rbxts/ui-labs";
import { DailyRewardScreen } from "client/components/menu/daily-reward/DailyRewardScreen";
import { RootProvider } from "client/providers/root-provider";
import { SECONDS_PER_DAY } from "shared/constants/daily-rewards";

const controls = {
	streakDay: Number(1, 1, 7, 1),
	lastClaimed: Choose(["Now (not claimable)", "24h ago (claimable)", "Never claimed"]),
};

function getLastClaimTime(choice: string): number {
	if (choice === "24h ago (claimable)") return os.time() - SECONDS_PER_DAY;
	if (choice === "Never claimed") return 0;
	return os.time();
}

interface StoryProps {
	streakDay: number;
	lastClaimed: string;
}

function DailyRewardScreenStoryContent({ streakDay, lastClaimed }: StoryProps) {
	const lastClaimTime = getLastClaimTime(lastClaimed);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
				<DailyRewardScreen streakDay={streakDay} lastClaimTime={lastClaimTime} onDismiss={() => {}} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { streakDay, lastClaimed } = props.controls;
		return <DailyRewardScreenStoryContent streakDay={streakDay as number} lastClaimed={lastClaimed as string} />;
	},
};

export = story;

import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number, String } from "@rbxts/ui-labs";
import { WinScreen } from "client/components/game/win/WinScreen";
import { RootProvider } from "client/providers/root-provider";
import type { WinData } from "client/store/screen";

const WIN_COUNTDOWN_SEC = 15;

const controls = {
	winnerName: String("iSentinel"),
	winnerUserId: Number(1, 1, 999999999),
	areaPercent: Number(92, 90, 100, 1),
	eliminations: Number(14, 0, 100, 1),
	moneyEarned: Number(50000, 0, 100000, 1000),
	crystalsEarned: Number(5, 0, 50, 1),
};

interface StoryProps {
	winnerName: string;
	winnerUserId: number;
	areaPercent: number;
	eliminations: number;
	moneyEarned: number;
	crystalsEarned: number;
}

function WinScreenStoryContent({
	winnerName,
	winnerUserId,
	areaPercent,
	eliminations,
	moneyEarned,
	crystalsEarned,
}: StoryProps) {
	const [winData, setWinData] = React.useState<WinData | undefined>(() => ({
		winnerId: winnerName,
		winnerName,
		winnerUserId,
		areaPercent,
		eliminations,
		moneyEarned,
		crystalsEarned,
		deadline: tick() + WIN_COUNTDOWN_SEC,
	}));

	useEffect(() => {
		setWinData({
			winnerId: winnerName,
			winnerName,
			winnerUserId,
			areaPercent,
			eliminations,
			moneyEarned,
			crystalsEarned,
			deadline: tick() + WIN_COUNTDOWN_SEC,
		});
	}, [winnerName, winnerUserId, areaPercent, eliminations, moneyEarned, crystalsEarned]);

	return (
		<RootProvider>
			<frame BackgroundColor3={Color3.fromRGB(17, 22, 34)} Size={new UDim2(1, 0, 1, 0)}>
				<WinScreen winData={winData} onDismiss={() => setWinData(undefined)} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { winnerName, winnerUserId, areaPercent, eliminations, moneyEarned, crystalsEarned } = props.controls;
		return (
			<WinScreenStoryContent
				winnerName={winnerName as string}
				winnerUserId={winnerUserId as number}
				areaPercent={areaPercent as number}
				eliminations={eliminations as number}
				moneyEarned={moneyEarned as number}
				crystalsEarned={crystalsEarned as number}
			/>
		);
	},
};

export = story;

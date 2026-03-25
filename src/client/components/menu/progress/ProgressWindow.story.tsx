import "client/app/react-config";

import React, { useCallback, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { useRem } from "client/ui/rem/useRem";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { defaultPlayerSave } from "shared/store/saves";

import { ProgressWindow } from "./ProgressWindow";

const controls = {
	lifetimeKills: Number(23, 0, 5000, 1),
	lifetimeArea: Number(180000, 0, 1000000000, 10000),
	lifetimeOrbsEarned: Number(850, 0, 1000000, 50),
	lifetimeTimeAlive: Number(4200, 0, 1800000, 60),
	lifetimeRank1: Number(3, 0, 250, 1),
	lifetimeOrbsSpent: Number(1200, 0, 200000, 50),
	lifetimeGamesPlayed: Number(18, 0, 10000, 1),
	ascensionLevel: Number(0, 0, 10, 1),
	balance: Number(1500, 0, 100000, 100),
	dailyStreak: Number(3, 0, 7, 1),
};

interface StoryContentProps {
	lifetimeKills: number;
	lifetimeArea: number;
	lifetimeOrbsEarned: number;
	lifetimeTimeAlive: number;
	lifetimeRank1: number;
	lifetimeOrbsSpent: number;
	lifetimeGamesPlayed: number;
	ascensionLevel: number;
	balance: number;
	dailyStreak: number;
}

function StoryContent(props: StoryContentProps) {
	const rem = useRem();
	const [killTier, setKillTier] = useState(2);

	const updateSave = useCallback(
		(kt: number) => {
			store.setPlayerSave(USER_NAME, {
				...defaultPlayerSave,
				balance: props.balance,
				dailyStreak: props.dailyStreak,
				lastDailyRewardClaim: os.time() - 86400,
				lifetimeKills: props.lifetimeKills,
				lifetimeAreaClaimed: props.lifetimeArea,
				lifetimeOrbsEarned: props.lifetimeOrbsEarned,
				lifetimeTimeAlive: props.lifetimeTimeAlive,
				lifetimeRank1Count: props.lifetimeRank1,
				lifetimeOrbsSpent: props.lifetimeOrbsSpent,
				lifetimeGamesPlayed: props.lifetimeGamesPlayed,
				milestoneProgress: {
					kills: kt,
					area: 2,
					orbsEarned: 1,
					timeAlive: 2,
					rank1: 1,
					orbsSpent: 1,
					gamesPlayed: 2,
				},
				bankedOrbs: 0,
				ascensionLevel: props.ascensionLevel,
			});
		},
		[props],
	);

	useEffect(() => {
		updateSave(killTier);
		return () => {
			store.deletePlayerSave(USER_NAME);
		};
	}, [
		props.lifetimeKills,
		props.lifetimeArea,
		props.lifetimeOrbsEarned,
		props.lifetimeTimeAlive,
		props.lifetimeRank1,
		props.lifetimeOrbsSpent,
		props.lifetimeGamesPlayed,
		props.ascensionLevel,
		props.balance,
		props.dailyStreak,
	]);

	const completeMilestone = useCallback(() => {
		const newTier = killTier + 1;
		setKillTier(newTier);
		updateSave(newTier);
	}, [killTier, updateSave]);

	return (
		<VStack
			size={new UDim2(1, 0, 1, 0)}
			automaticSize={Enum.AutomaticSize.Y}
			spacing={rem(3)}
			horizontalAlignment={Enum.HorizontalAlignment.Center}
			padding={rem(3)}
		>
			<ProgressWindow onClose={() => {}} />

			{/* Trigger completion button — overlaid at bottom */}
			<textbutton
				Text=""
				BackgroundTransparency={1}
				Size={new UDim2(0, rem(20), 0, rem(3.5))}
				Position={new UDim2(0.5, 0, 1, rem(-5))}
				AnchorPoint={new Vector2(0.5, 0)}
				ZIndex={100}
				Event={{ Activated: completeMilestone }}
			>
				<Frame
					size={new UDim2(1, 0, 1, 0)}
					backgroundColor={palette.green}
					backgroundTransparency={0.15}
					cornerRadius={new UDim(0, rem(1))}
				>
					<uistroke Color={palette.white} Thickness={rem(0.1)} Transparency={0.5} />
					<Text
						font={fonts.fredokaOne.regular}
						text={`Complete Kills Tier ${killTier + 1}`}
						textColor={palette.white}
						textSize={rem(1.2)}
						size={new UDim2(1, 0, 1, 0)}
						backgroundTransparency={1}
					>
						<uistroke Thickness={rem(0.08)} Color={Color3.fromHex("#000")} Transparency={0.5} />
					</Text>
				</Frame>
			</textbutton>
		</VStack>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const c = props.controls;
		return (
			<RootProvider>
				<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
					<StoryContent
						lifetimeKills={c.lifetimeKills as number}
						lifetimeArea={c.lifetimeArea as number}
						lifetimeOrbsEarned={c.lifetimeOrbsEarned as number}
						lifetimeTimeAlive={c.lifetimeTimeAlive as number}
						lifetimeRank1={c.lifetimeRank1 as number}
						lifetimeOrbsSpent={c.lifetimeOrbsSpent as number}
						lifetimeGamesPlayed={c.lifetimeGamesPlayed as number}
						ascensionLevel={c.ascensionLevel as number}
						balance={c.balance as number}
						dailyStreak={c.dailyStreak as number}
					/>
				</frame>
			</RootProvider>
		);
	},
};

export = story;

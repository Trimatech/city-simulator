import "client/app/react-config";

import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
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

import { MilestoneWidget } from "./MilestoneWidget";

const controls = {
	lifetimeKills: Number(23, 0, 5000, 1),
	lifetimeGamesPlayed: Number(22, 0, 10000, 1),
};

interface StoryContentProps {
	lifetimeKills: number;
	lifetimeGamesPlayed: number;
}

function StoryContent(props: StoryContentProps) {
	const rem = useRem();
	const [killTier, setKillTier] = useState(2);
	const [gamesTier, setGamesTier] = useState(2);
	const initialized = useRef(false);

	const updateSave = useCallback(
		(kt: number, gt: number) => {
			store.setPlayerSave(USER_NAME, {
				...defaultPlayerSave,
				lifetimeKills: props.lifetimeKills,
				lifetimeAreaClaimed: 180000,
				lifetimeOrbsEarned: 850,
				lifetimeTimeAlive: 1600,
				lifetimeRank1Count: 4,
				lifetimeOrbsSpent: 1800,
				lifetimeGamesPlayed: props.lifetimeGamesPlayed,
				milestoneProgress: {
					kills: kt,
					area: 2,
					orbsEarned: 1,
					timeAlive: 2,
					rank1: 1,
					orbsSpent: 1,
					gamesPlayed: gt,
				},
				bankedOrbs: 0,
				ascensionLevel: 0,
			});
		},
		[props.lifetimeKills, props.lifetimeGamesPlayed],
	);

	useEffect(() => {
		updateSave(killTier, gamesTier);
		initialized.current = true;
		return () => {
			store.deletePlayerSave(USER_NAME);
		};
	}, [props.lifetimeKills, props.lifetimeGamesPlayed]);

	const completeMilestone = useCallback(() => {
		const newKillTier = killTier + 1;
		setKillTier(newKillTier);
		updateSave(newKillTier, gamesTier);
	}, [killTier, gamesTier, updateSave]);

	return (
		<VStack size={new UDim2(1, 0, 1, 0)} spacing={rem(3)} padding={rem(3)}>
			<MilestoneWidget />

			{/* Trigger button */}
			<textbutton
				Text=""
				BackgroundTransparency={1}
				Size={new UDim2(0, rem(18), 0, rem(3.5))}
				Position={new UDim2(0, 0, 0.5, rem(8))}
				Event={{ Activated: completeMilestone }}
			>
				<Frame
					size={new UDim2(1, 0, 1, 0)}
					backgroundColor={palette.green}
					backgroundTransparency={0.2}
					cornerRadius={new UDim(0, rem(1))}
				>
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
						lifetimeGamesPlayed={c.lifetimeGamesPlayed as number}
					/>
				</frame>
			</RootProvider>
		);
	},
};

export = story;

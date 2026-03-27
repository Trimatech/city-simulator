import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { defaultPlayerSave } from "shared/store/saves/save-types";

import { TutorialHints } from "./TutorialHints";

const controls = {
	orbs: Number(50, 0, 400, 1),
	isInside: Boolean(true),
	gamesPlayed: Number(0, 0, 10, 1),
	orbsSpent: Number(0, 0, 500, 1),
};

function StoryComponent({
	orbs,
	isInside,
	gamesPlayed,
	orbsSpent,
}: {
	orbs: number;
	isInside: boolean;
	gamesPlayed: number;
	orbsSpent: number;
}) {
	useEffect(() => {
		store.setPlayerSave(USER_NAME, {
			...defaultPlayerSave,
			lifetimeGamesPlayed: gamesPlayed,
			lifetimeOrbsSpent: orbsSpent,
		});
	}, [gamesPlayed, orbsSpent]);

	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			skin: getRandomBotSkin().id,
			orbs,
			isInside,
		});
	}, [orbs, isInside]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<TutorialHints />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { orbs, isInside, gamesPlayed, orbsSpent } = props.controls;
		return <StoryComponent orbs={orbs} isInside={isInside} gamesPlayed={gamesPlayed} orbsSpent={orbsSpent} />;
	},
};

export = story;

import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { Boolean, InferFusionProps } from "@rbxts/ui-labs";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { POWERUP_DURATIONS } from "shared/constants/powerups";
import { getRandomBotSkin } from "shared/constants/skins";

import { SpeedEffect } from "./SpeedEffect";

const controls = {
	active: Boolean(true),
	paused: Boolean(false),
};

function SpeedEffectStoryContent({ active, paused }: { active: boolean; paused: boolean }) {
	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			skin: getRandomBotSkin().id,
			orbs: 0,
		});
	}, []);

	useEffect(() => {
		store.setSoldierTurboActiveUntil(
			USER_NAME,
			active ? Workspace.GetServerTimeNow() + POWERUP_DURATIONS.turbo : 0,
		);
	}, [active]);

	return (
		<RootProvider>
			<frame BackgroundColor3={new Color3(0, 0, 0)} Size={new UDim2(1, 0, 1, 0)}>
				<SpeedEffect paused={paused} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { active, paused } = props.controls;
		return <SpeedEffectStoryContent active={active as boolean} paused={paused as boolean} />;
	},
};

export = story;

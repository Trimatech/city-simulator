import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { PowerupsPanel } from "client/components/game/right/powerups/PowerupsPanel";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { POWERUP_DURATIONS } from "shared/constants/powerups";
import { getRandomBotSkin } from "shared/constants/skins";

const controls = {
	orbs: Number(120, 0, 1000, 1),
	turboActive: Boolean(false),
};

function CustomComponent({ orbs, turboActive }: { orbs: number; turboActive: boolean }) {
	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			skin: getRandomBotSkin().id,
			orbs,
		});
	}, [orbs]);

	useEffect(() => {
		store.setSoldierTurboActiveUntil(USER_NAME, turboActive ? tick() + POWERUP_DURATIONS.turbo : 0);
	}, [turboActive]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Position={new UDim2(0, 0, 0, 0)}>
				<PowerupsPanel anchorPoint={new Vector2(0.5, 0.5)} position={new UDim2(0.5, 0, 0.5, 0)} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { orbs, turboActive } = props.controls;
		return <CustomComponent orbs={orbs} turboActive={turboActive} />;
	},
};

export = story;

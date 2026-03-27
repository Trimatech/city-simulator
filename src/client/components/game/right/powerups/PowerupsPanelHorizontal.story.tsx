import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { PowerupsPanelHorizontal } from "client/components/game/right/powerups/PowerupsPanelHorizontal";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { POWERUP_DURATIONS } from "shared/constants/powerups";
import { getRandomBotSkin } from "shared/constants/skins";

const controls = {
	orbs: Number(120, 0, 1000, 1),
	turboActive: Boolean(false),
	shieldActive: Boolean(false),
};

function CustomComponent({
	orbs,
	turboActive,
	shieldActive,
}: {
	orbs: number;
	turboActive: boolean;
	shieldActive: boolean;
}) {
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

	useEffect(() => {
		store.setSoldierShieldActiveUntil(USER_NAME, shieldActive ? tick() + POWERUP_DURATIONS.shield : 0);
	}, [shieldActive]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Position={new UDim2(0.2, 0, 0.5, 0)}>
				<PowerupsPanelHorizontal visible={true} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { orbs, turboActive, shieldActive } = props.controls;
		return <CustomComponent orbs={orbs} turboActive={turboActive} shieldActive={shieldActive} />;
	},
};

export = story;

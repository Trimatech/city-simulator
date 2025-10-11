import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { PowerupsPanel } from "client/components/game/right/powerups/PowerupsPanel";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { getRandomBaseSoldierSkin } from "shared/constants/skins";

const controls = {
	orbs: Number(120, 0, 1000, 1),
};

function CustomComponent({ orbs }: { orbs: number }) {
	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			skin: getRandomBaseSoldierSkin().id,
			orbs,
		});
	}, [orbs]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
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
		const { orbs } = props.controls;
		return <CustomComponent orbs={orbs} />;
	},
};

export = story;

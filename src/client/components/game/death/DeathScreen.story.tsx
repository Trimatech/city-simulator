import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { DeathScreen } from "client/components/game/death/DeathScreen";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { DEATH_CHOICE_TIMEOUT_SEC, USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

const controls = {
	crystals: Number(3, 0, 10, 1),
};

interface StoryProps {
	crystals: number;
}

function DeathScreenStoryContent({ crystals }: StoryProps) {
	useEffect(() => {
		store.setPlayerSave(USER_NAME, { ...defaultPlayerSave, crystals });
	}, [crystals]);

	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			dead: true,
			deathChoiceDeadline: tick() + DEATH_CHOICE_TIMEOUT_SEC,
		});
		return () => {
			store.removeSoldier(USER_NAME);
		};
	}, []);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
				<DeathScreen />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { crystals } = props.controls;
		return <DeathScreenStoryContent crystals={crystals as number} />;
	},
};

export = story;

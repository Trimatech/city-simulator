import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { DeathScreen } from "client/components/game/death/DeathScreen";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { DEATH_CHOICE_TIMEOUT_SEC, USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

const controls = {
	crystals: Number(3, 0, 10, 1),
	persistent: Boolean(true),
};

interface StoryProps {
	crystals: number;
	persistent: boolean;
}

function DeathScreenStoryContent({ crystals, persistent }: StoryProps) {
	const [deadline] = React.useState(() => tick() + DEATH_CHOICE_TIMEOUT_SEC);

	useEffect(() => {
		store.setPlayerSave(USER_NAME, { ...defaultPlayerSave, crystals });
	}, [crystals]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
				<DeathScreen activeDeadline={deadline} persistent={persistent} onDismiss={() => {}} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { crystals, persistent } = props.controls;
		return <DeathScreenStoryContent crystals={crystals as number} persistent={persistent as boolean} />;
	},
};

export = story;

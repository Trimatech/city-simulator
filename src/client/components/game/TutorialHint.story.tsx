import "client/app/react-config";

import React, { useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, String } from "@rbxts/ui-labs";
import { RootProvider } from "client/providers/root-provider";

import { TutorialHint } from "./TutorialHint";

const controls = {
	text: String(
		"Leave your area to claim new ground! Orbs inside will be auto-collected. Tip: don't grab too much at once - if an enemy touches your trail wall, you're eliminated!",
	),
	visible: Boolean(true),
};

function StoryComponent({ text, visible }: { text: string; visible: boolean }) {
	const [dismissed, setDismissed] = useState(false);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<TutorialHint text={text} visible={visible && !dismissed} onDismiss={() => setDismissed(true)} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { text, visible } = props.controls;
		return <StoryComponent text={text} visible={visible} />;
	},
};

export = story;

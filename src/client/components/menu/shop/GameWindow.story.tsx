import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, InferFusionProps } from "@rbxts/ui-labs";
import { GameWindow, GameWindowVariant } from "client/components/menu/shop/GameWindow";
import { RootProvider } from "client/providers/root-provider";

const VARIANTS: GameWindowVariant[] = ["default", "progress"];

const controls = {
	variant: Choose(VARIANTS),
};

function GameWindowStoryContent({ variant }: { variant: GameWindowVariant }) {
	return (
		<RootProvider>
			<GameWindow
				variant={variant}
				header={
					<textlabel
						Text={`GameWindow — ${variant}`}
						TextColor3={Color3.fromHex("#ffffff")}
						TextSize={20}
						BackgroundTransparency={1}
						Size={new UDim2(1, 0, 0, 30)}
						Font={Enum.Font.GothamBold}
					/>
				}
			>
				<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 200)} />
			</GameWindow>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { variant } = props.controls;
		return <GameWindowStoryContent variant={variant as GameWindowVariant} />;
	},
};

export = story;

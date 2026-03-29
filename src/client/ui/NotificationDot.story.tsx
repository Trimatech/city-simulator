import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, InferFusionProps, Number } from "@rbxts/ui-labs";
import { RootProvider } from "client/providers/root-provider";
import { NotificationDot } from "client/ui/NotificationDot";

const controls = {
	visible: Choose(["true", "false"]),
	size: Number(12, 6, 30, 1),
};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const visible = props.controls.visible === "true";
		const size = props.controls.size as number;

		return (
			<RootProvider>
				<frame
					BackgroundTransparency={0.8}
					BackgroundColor3={Color3.fromRGB(40, 40, 60)}
					Size={new UDim2(0, 200, 0, 200)}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					AnchorPoint={new Vector2(0.5, 0.5)}
				>
					<NotificationDot visible={visible} size={size} position={new UDim2(1, -10, 0, 10)} />
				</frame>
			</RootProvider>
		);
	},
};

export = story;

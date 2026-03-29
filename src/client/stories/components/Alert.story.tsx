import "client/app/react-config";

import { useMountEffect } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { sendAlert } from "client/alerts";
import { Alerts } from "client/components/alerts";
import { Backdrop } from "client/components/world/backdrop";
import { RootProvider } from "client/providers/root-provider";
import { palette } from "shared/constants/palette";

function AlertStoryContent() {
	useMountEffect(() => {
		const duration = 9999;
		sendAlert({ emoji: "ℹ️", color: palette.blue, message: "Info alert", duration });
		sendAlert({ emoji: "✅", color: palette.green, message: "Success alert", duration });
		sendAlert({ emoji: "⚠️", color: palette.yellow, message: "Warning alert", duration });
		sendAlert({ emoji: "🚨", color: palette.red, message: "Error alert", duration });
		sendAlert({
			emoji: "🎉",
			color: palette.mauve,
			colorSecondary: palette.blue,
			message: "Gradient alert",
			duration,
		});
	});

	return (
		<RootProvider>
			<Backdrop />
			<Alerts />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <AlertStoryContent />,
};

export = story;

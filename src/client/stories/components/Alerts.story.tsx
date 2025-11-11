import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { sendAlert } from "client/alerts";
import { Alerts } from "client/components/alerts";
import { Backdrop } from "client/components/world/backdrop";
import { RootProvider } from "client/providers/root-provider";
import { InputCapture } from "client/ui/input-capture";
import { palette } from "shared/constants/palette";

function AlertsStoryContent() {
	const modes = ["info", "success", "warning", "error", "awesome"] as const;

	const alert = () => {
		const mode = modes[math.random(0, modes.size() - 1)];

		switch (mode) {
			case "info":
				sendAlert({ emoji: "ℹ️", color: palette.blue, message: "This is an info alert." });
				return;
			case "success":
				sendAlert({ emoji: "✅", color: palette.green, message: "This is a success alert." });
				return;
			case "warning":
				sendAlert({ emoji: "⚠️", color: palette.yellow, message: "This is a warning alert." });
				return;
			case "error":
				sendAlert({ emoji: "🚨", color: palette.red, message: "This is an error alert." });
				return;
			case "awesome":
				sendAlert({
					emoji: "🎉",
					color: palette.mauve,
					colorSecondary: palette.blue,
					message: "This is an awesome alert.",
				});
				return;
		}
	};

	return (
		<RootProvider>
			<Backdrop />
			<Alerts />
			<InputCapture
				onInputBegan={(_, input) => {
					if (input.KeyCode === Enum.KeyCode.F) {
						alert();
					}
				}}
			/>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <AlertsStoryContent />,
};

export = story;

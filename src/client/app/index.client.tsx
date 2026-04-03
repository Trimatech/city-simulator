import "./react-config";

import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { ReflexProvider } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { store } from "client/store";

import { App } from "./app";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");

// Allow far zoom for top-down city view
Players.LocalPlayer.CameraMaxZoomDistance = 500;

root.render(
	createPortal(
		<ReflexProvider producer={store}>
			<App />
		</ReflexProvider>,
		target,
	),
);

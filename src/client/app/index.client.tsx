import "./react-config";

import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { initializeWallAnimator } from "client/components/walls/wall-animator";
import { initializeCandyAnimator } from "client/components/world/candies/candy-animator";
import { initializeExplosionEffects } from "client/components/world/explosions/explosion-events";
import { RootProvider } from "client/providers/root-provider";
import { IS_LOCAL } from "shared/constants/core";

import { App } from "./app";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");

// Limit max camera zoom-out for the local player
Players.LocalPlayer.CameraMaxZoomDistance = IS_LOCAL ? 400 : 25;

root.render(
	createPortal(
		// <StrictMode>
		<RootProvider>
			<App />
		</RootProvider>,
		// </StrictMode>,
		target,
	),
);

// Initialize non-React explosion events (self-cleaning per call)
initializeExplosionEffects();

// Initialize server-side wall animation (CollectionService-based)
initializeWallAnimator();

// Initialize server-side candy animation (CollectionService-based)
initializeCandyAnimator();

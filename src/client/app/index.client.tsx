import "./react-config";

import React from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";
import { initializeWallAnimator } from "client/components/walls/wall-animator";
import { initializeEnemyWallProximity } from "client/components/walls/enemy-wall-proximity";
import { initializeWallGateEffect } from "client/components/walls/wall-gate-effect";
import { initializeCandyAnimator } from "client/components/world/candies/candy-animator";
import { initializeExplosionEffects } from "client/components/world/explosions/explosion-events";
import { initializeRewardAnimator } from "client/components/world/rewards/reward-animator";
import { RootProvider } from "client/providers/root-provider";
import { IS_LOCAL } from "shared/constants/core";

import { App } from "./app";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");

// Limit max camera zoom-out for the local player
Players.LocalPlayer.CameraMaxZoomDistance = IS_LOCAL ? 400 : 80;

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

// Lift own walls near the player to create a walkable "gate" arch
initializeWallGateEffect();

// Track proximity to enemy walls for breach overlay + crumble effects
initializeEnemyWallProximity();

// Initialize server-side candy animation (CollectionService-based)
initializeCandyAnimator();

// Initialize server-side reward animation (CollectionService-based)
initializeRewardAnimator();

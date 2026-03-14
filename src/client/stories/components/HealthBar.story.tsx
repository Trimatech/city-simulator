import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { HealthBar } from "client/components/game/health/HealthBar";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";

const controls = {
	health: Number(75, 0, 100, 1),
	maxHealth: Number(100, 25, 200, 5),
};

interface StoryProps {
	health: number;
	maxHealth: number;
}

function HealthBarStoryContent({ health, maxHealth }: StoryProps) {
	useEffect(() => {
		store.addSoldier(USER_NAME, {
			name: USER_NAME,
			position: new Vector2(0, 0),
			health: math.clamp(health, 0, maxHealth),
			maxHealth,
		});
	}, []);

	useEffect(() => {
		store.patchSoldier(USER_NAME, { maxHealth });
		store.setSoldierHealth(USER_NAME, math.clamp(health, 0, maxHealth));
	}, [health, maxHealth]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
				<frame
					BackgroundTransparency={1}
					Size={new UDim2(0, 180, 0, 28)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={new UDim2(0.5, 0, 0.5, 0)}
				>
					<HealthBar />
				</frame>
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { health, maxHealth } = props.controls;
		return <HealthBarStoryContent health={health as number} maxHealth={maxHealth as number} />;
	},
};

export = story;

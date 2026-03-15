import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { HealthBar } from "./HealthBar";

const ROBLOX_TOOLBAR_HEIGHT = 68;
const ROBLOX_TOOLBAR_WIDTH = 150;

export function HealthView() {
	const rem = useRem();

	const iconSize = rem(3.5);

	return (
		<HStack
			name="HealthView"
			size={new UDim2(0, rem(25), 0, ROBLOX_TOOLBAR_HEIGHT)}
			position={new UDim2(0, ROBLOX_TOOLBAR_WIDTH, 0, 0)}
			spacing={rem(0.5)}
			padding={30}
		>
			<imagelabel
				Image={assets.ui.heart}
				BackgroundTransparency={1}
				Size={new UDim2(0, iconSize, 0, iconSize)}
				ScaleType={Enum.ScaleType.Fit}
			/>
			<frame BackgroundTransparency={1} Size={new UDim2(1, -iconSize - rem(0.5), 0, rem(2))}>
				<HealthBar />
			</frame>
		</HStack>
	);
}

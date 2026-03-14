import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { HealthBar } from "./HealthBar";

export function HealthView() {
	const rem = useRem();

	const iconSize = rem(3.5);

	return (
		<HStack
			name="HealthView"
			size={new UDim2(0.3, 0, 0, iconSize)}
			position={new UDim2(0, rem(3), 0, rem(6))}
			anchorPoint={new Vector2(0, 0)}
			verticalAlignment={Enum.VerticalAlignment.Center}
			spacing={rem(0.5)}
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

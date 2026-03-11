import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { VStack } from "@rbxts-ui/layout";
import { Text } from "@rbxts-ui/primitives";

import { HealthBar } from "./HealthBar";

export function HealthView() {
	const rem = useRem();

	return (
		<VStack
			name="HealthView"
			size={new UDim2(0, rem(2), 0.2, 0)}
			position={new UDim2(0, rem(3), 0, rem(6))}
			anchorPoint={new Vector2(0, 0)}
			horizontalAlignment={Enum.HorizontalAlignment.Center}
			spacing={rem(0.5)}
		>
			<HealthBar />
			<Text text={`❤️`} textSize={rem(1.5)} size={new UDim2(0, rem(2), 0, rem(2))} />
		</VStack>
	);
}

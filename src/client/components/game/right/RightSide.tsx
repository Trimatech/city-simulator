import React from "@rbxts/react";
import { Group } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";

import { PowerupsPanel } from "./powerups/PowerupsPanel";

export function RightSide() {
	const rem = useRem();

	return (
		<Group
			name="RightSide"
			anchorPoint={new Vector2(1, 0.5)}
			size={new UDim2(0, rem(8), 1, 0)}
			position={new UDim2(1, 0, 0.5, 0)}
		>
			<PowerupsPanel />
		</Group>
	);
}

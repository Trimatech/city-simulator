import React from "@rbxts/react";
import { Group } from "client/components/ui/group";
import { useRem } from "client/hooks";

import { BuyTowerButton } from "./BuyTowerButton";

export function RightSide() {
	const rem = useRem();

	return (
		<Group
			name="RightSide"
			anchorPoint={new Vector2(1, 1)}
			size={new UDim2(0, rem(10), 0, rem(10))}
			position={new UDim2(1, 0, 0.5, 0)}
		>
			<BuyTowerButton anchorPoint={new Vector2(0.5, 0.5)} position={new UDim2(0.5, 0, 0.5, 0)} />
		</Group>
	);
}

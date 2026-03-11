import React from "@rbxts/react";

import { Frame } from "@rbxts-ui/primitives";

export interface HFillProps {
	readonly backgroundTransparency?: number;
	readonly name?: string;
	readonly layoutOrder?: number;
	readonly verticalSize?: number;
}

/**
 * Fills remaining horizontal space when placed inside an HStack.
 * Uses UDim2(0, 0, 1, 0) + UIFlexMode.Fill to expand horizontally.
 */
export function HFill({ backgroundTransparency = 1, name, layoutOrder, verticalSize = 1 }: HFillProps) {
	return (
		<Frame
			size={new UDim2(0, 0, verticalSize, 0)}
			backgroundTransparency={backgroundTransparency}
			name={name}
			layoutOrder={layoutOrder}
		>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</Frame>
	);
}

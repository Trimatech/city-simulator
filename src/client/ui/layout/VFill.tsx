import React from "@rbxts/react";

import { Frame } from "@rbxts-ui/primitives";

export interface VFillProps {
	readonly backgroundTransparency?: number;
	readonly name?: string;
	readonly layoutOrder?: number;
	readonly horizontalSize?: number;
}

/**
 * Fills remaining vertical space when placed inside a VStack.
 * Uses UDim2(1, 0, 0, 0) + UIFlexMode.Fill to expand vertically.
 */
export function VFill({ backgroundTransparency = 1, name, layoutOrder, horizontalSize = 1 }: VFillProps) {
	return (
		<Frame
			size={new UDim2(horizontalSize, 0, 0, 0)}
			backgroundTransparency={backgroundTransparency}
			name={name}
			layoutOrder={layoutOrder}
		>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</Frame>
	);
}

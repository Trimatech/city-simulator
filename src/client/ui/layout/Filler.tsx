import React from "@rbxts/react";

import { Frame } from "./frame";

export function Filler({ size }: { size?: UDim2 }) {
	return (
		<Frame key={"filler"} size={size ?? new UDim2(0, 0, 1, 0)} backgroundTransparency={1}>
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
		</Frame>
	);
}

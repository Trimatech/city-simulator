import React from "@rbxts/react";

export interface PaddingProps {
	padding?: number;
	paddingY?: number;
	paddingX?: number;
}

export function Padding(props: PaddingProps) {
	const { padding = 0, paddingY, paddingX } = props;

	return (
		<uipadding
			PaddingTop={new UDim(0, paddingY ?? padding)}
			PaddingBottom={new UDim(0, paddingY ?? padding)}
			PaddingLeft={new UDim(0, paddingX ?? padding)}
			PaddingRight={new UDim(0, paddingX ?? padding)}
		/>
	);
}

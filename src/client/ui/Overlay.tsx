import React from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { palette } from "shared/constants/palette";

interface OverlayProps {
	onClick: () => void;
}

export function Overlay({ onClick }: OverlayProps) {
	return (
		<ReactiveButton2
			onClick={onClick}
			backgroundTransparency={0.2}
			backgroundColor={palette.teal}
			size={new UDim2(1, 0, 1, 0)}
			position={new UDim2(0, 0, 0, 0)}
		/>
	);
}

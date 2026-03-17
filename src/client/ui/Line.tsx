import { Frame } from "@rbxts-ui/primitives";
import React from "@rbxts/react";

export interface LineProps {
	// Pixel coordinates for start point
	startX: number;
	startY: number;
	// Pixel coordinates for end point
	endX: number;
	endY: number;
	thickness: number;
	color: Color3;
	transparency?: number;
	zIndex?: number;
}

export const Line = ({ startX, startY, endX, endY, thickness, color, transparency = 0, zIndex = 1 }: LineProps) => {
	const deltaX = endX - startX;
	const deltaY = endY - startY;
	const length = math.sqrt(deltaX * deltaX + deltaY * deltaY);
	const angle = math.deg(math.atan2(deltaY, deltaX));

	// Calculate midpoint for centering the line
	const midX = (startX + endX) / 2;
	const midY = (startY + endY) / 2;

	return (
		<Frame
			position={new UDim2(0, midX, 0, midY)}
			size={new UDim2(0, length, 0, thickness)}
			anchorPoint={new Vector2(0.5, 0.5)}
			rotation={angle}
			backgroundColor={color}
			backgroundTransparency={transparency}
			zIndex={zIndex}
		/>
	);
};

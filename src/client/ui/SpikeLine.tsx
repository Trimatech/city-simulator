import React from "@rbxts/react";
import assets from "shared/assets";

export interface SpikeLineProps {
	readonly startX: number;
	readonly startY: number;
	readonly endX: number;
	readonly endY: number;
	readonly thickness: number;
	readonly color?: Color3;
	readonly transparency?: number;
	readonly zIndex?: number;
}

// Spike image: tip at top (y=0), base at bottom (y=1).
// Rendered so the base sits at (startX, startY) and the tip points toward (endX, endY).
export function SpikeLine({
	startX,
	startY,
	endX,
	endY,
	thickness,
	color = new Color3(1, 1, 1),
	transparency = 0,
	zIndex = 1,
}: SpikeLineProps) {
	const deltaX = endX - startX;
	const deltaY = endY - startY;
	const spikeLength = math.sqrt(deltaX * deltaX + deltaY * deltaY);
	const rotation = math.deg(math.atan2(deltaX, -deltaY));
	const midX = (startX + endX) / 2;
	const midY = (startY + endY) / 2;

	return (
		<imagelabel
			Image={assets.ui.speed_spike}
			ImageColor3={color}
			ImageTransparency={transparency}
			BackgroundTransparency={1}
			Position={new UDim2(0, midX, 0, midY)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Size={new UDim2(0, thickness, 0, spikeLength)}
			Rotation={rotation}
			ZIndex={zIndex}
			ScaleType={Enum.ScaleType.Stretch}
		/>
	);
}

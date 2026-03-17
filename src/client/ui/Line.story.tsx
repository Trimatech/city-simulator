import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Frame } from "@rbxts-ui/primitives";
import { RemProvider } from "client/ui/rem/RemProvider";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { Line } from "./Line";

const StoryComponent = () => {
	const rem = useRem();

	const thickness = rem(5, "pixel");

	// Define test coordinates in pixels
	const centerX = rem(400, "pixel");
	const centerY = rem(400, "pixel");

	return (
		<Frame
			size={new UDim2(0, rem(1000, "pixel"), 0, rem(1000, "pixel"))}
			backgroundColor={Color3.fromRGB(30, 30, 30)}
			backgroundTransparency={0}
		>
			{/* Horizontal line - Dark Blue */}
			<Line
				startX={rem(100, "pixel")}
				startY={centerY}
				endX={rem(700, "pixel")}
				endY={centerY}
				thickness={thickness}
				color={palette.blue1}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Vertical line - Glow Cyan */}
			<Line
				startX={centerX}
				startY={rem(100, "pixel")}
				endX={centerX}
				endY={rem(700, "pixel")}
				thickness={thickness}
				color={palette.blue2}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Diagonal line (top-left to bottom-right) - Green */}
			<Line
				startX={rem(100, "pixel")}
				startY={rem(100, "pixel")}
				endX={rem(700, "pixel")}
				endY={rem(700, "pixel")}
				thickness={thickness}
				color={Color3.fromRGB(0, 255, 0)}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Diagonal line (top-right to bottom-left) - Blue */}
			<Line
				startX={rem(700, "pixel")}
				startY={rem(100, "pixel")}
				endX={rem(100, "pixel")}
				endY={rem(700, "pixel")}
				thickness={thickness}
				color={Color3.fromRGB(0, 100, 255)}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Radiating lines from center */}
			{/* Top - White */}
			<Line
				startX={centerX}
				startY={centerY}
				endX={centerX}
				endY={rem(50, "pixel")}
				thickness={thickness}
				color={palette.white}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Right - White */}
			<Line
				startX={centerX}
				startY={centerY}
				endX={rem(750, "pixel")}
				endY={centerY}
				thickness={thickness}
				color={palette.white}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Bottom - Cyan Darker */}
			<Line
				startX={centerX}
				startY={centerY}
				endX={centerX}
				endY={rem(750, "pixel")}
				thickness={thickness}
				color={palette.blue2}
				transparency={0.3}
				zIndex={1}
			/>

			{/* Left - Bright Cyan */}
			<Line
				startX={centerX}
				startY={centerY}
				endX={rem(50, "pixel")}
				endY={centerY}
				thickness={thickness}
				color={palette.blue1}
				transparency={0.3}
				zIndex={1}
			/>
		</Frame>
	);
};

export = (target: Frame) => {
	const root = ReactRoblox.createRoot(target);
	root.render(
		<RemProvider>
			<StoryComponent />
		</RemProvider>,
	);

	return () => {
		root.unmount();
	};
};

import React, { useRef } from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const INNER_BORDER_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#373737")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#000000")),
]);

interface StylizedBox2Props extends React.PropsWithChildren {
	borderColor: Color3 | React.Binding<Color3>;
	borderTransparency?: number | React.Binding<number>;
	borderThickness?: number;
	backgroundColor?: Color3 | React.Binding<Color3>;
	backgroundTransparency?: number | React.Binding<number>;
	cornerRadius?: number;
	size?: UDim2 | React.Binding<UDim2>;
	automaticSize?: Enum.AutomaticSize;
	extraStrokes?: React.Element;
}

export function StylizedBox2({
	borderColor,
	borderTransparency = 0.64,
	borderThickness,
	backgroundColor = Color3.fromRGB(0, 0, 0),
	backgroundTransparency = 0.42,
	cornerRadius = 1,
	size = new UDim2(1, 0, 0, 0),
	automaticSize = Enum.AutomaticSize.Y,
	extraStrokes,
	children,
}: StylizedBox2Props) {
	const rem = useRem();
	const corner = new UDim(0, rem(cornerRadius));
	const patternRef = useRef<ImageLabel>();

	return (
		<Frame
			backgroundColor={backgroundColor}
			backgroundTransparency={backgroundTransparency}
			cornerRadius={corner}
			size={size}
			automaticSize={automaticSize}
			change={{
				AbsoluteSize: (rbx) => {
					if (patternRef.current) {
						patternRef.current.Size = new UDim2(1, 0, 0, rbx.AbsoluteSize.Y);
					}
				},
			}}
		>
			{/* Outer border */}
			<uistroke
				Color={borderColor}
				Transparency={borderTransparency}
				Thickness={rem(borderThickness ?? 0.4)}
				ZIndex={1}
			/>
			{/* Inner gradient border */}
			<uistroke Color={palette.white} Transparency={0.45} Thickness={rem(0.2)} ZIndex={2}>
				<uigradient Color={INNER_BORDER_GRADIENT} Rotation={90} />
			</uistroke>

			{extraStrokes}

			{/* Dots pattern — sized via change listener so it doesn't affect automaticSize */}
			<imagelabel
				ref={patternRef}
				Image={assets.ui.patterns.dots_pattern}
				ImageColor3={palette.white}
				ImageTransparency={0.96}
				ScaleType={Enum.ScaleType.Tile}
				TileSize={new UDim2(0, rem(4), 0, rem(4))}
				Size={new UDim2(1, 0, 0, 0)}
				BackgroundTransparency={1}
			>
				<uicorner CornerRadius={corner} />
			</imagelabel>

			{children}
		</Frame>
	);
}

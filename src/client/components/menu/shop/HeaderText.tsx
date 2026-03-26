import React from "@rbxts/react";
import { Frame, Text, TextProps } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

export interface HeaderTextProps {
	readonly text: string;
	readonly separator?: string;
}

const fontSize = 4.5;
const layerOffsetY = 0.35;
const strokeThickness = 0.25;

const TEXT_BG_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#FFEC7D")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#F5B32B")),
]);

const TEXT_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, palette.subtitleStrokeFrom),
	new ColorSequenceKeypoint(1, palette.subtitleStrokeTo),
]);

export function HeaderText({ text, separator = " " }: HeaderTextProps) {
	const rem = useRem();

	const displayText = text.split("").join(separator);

	const textSize = rem(fontSize);
	const offset = rem(layerOffsetY);
	const layerY = new UDim2(0.5, 0, 0, 0);
	const layer2Y = new UDim2(0.5, 0, 0, offset);
	const layer3Y = new UDim2(0.5, 0, 0, offset);

	const textProps: TextProps = {
		text: displayText,
		textSize: textSize,
		font: fonts.fredokaOne.bold,
		size: new UDim2(1, 0, 0, 0),
		automaticSize: Enum.AutomaticSize.Y,
		anchorPoint: new Vector2(0.5, 0),
		textXAlignment: "Center",
		backgroundTransparency: 1,
		richText: true,
	};

	return (
		<Frame name="HeaderText" size={new UDim2(1, 0, 0, textSize + offset * 2)} backgroundTransparency={1}>
			{/* Layer 1 - Top, gradient-filled text with gradient stroke */}
			<Text name="HeaderLayer1" textColor={palette.yellow} position={layerY} zIndex={3} {...textProps}>
				<uigradient Color={TEXT_BG_GRADIENT} Rotation={90} />
				<uistroke Thickness={rem(strokeThickness)} Color={palette.white}>
					<uigradient Color={TEXT_STROKE_GRADIENT} Rotation={90} />
				</uistroke>
			</Text>

			{/* Layer 2 - Stroke-only outline, 35% transparency */}
			<Text name="HeaderLayer2" textColor={palette.black} position={layer2Y} zIndex={2} {...textProps}>
				<uistroke Color={palette.black} Thickness={rem(strokeThickness)} />
			</Text>

			{/* Layer 2 - Stroke-only outline, 35% transparency */}
			<Text
				name="HeaderLayer3"
				textColor={palette.black}
				position={layer3Y}
				zIndex={1}
				textTransparency={0.9}
				{...textProps}
				textSize={textSize}
			>
				<uistroke Color={palette.black} Thickness={rem(strokeThickness * 1.7)} Transparency={0.9} />
			</Text>
		</Frame>
	);
}

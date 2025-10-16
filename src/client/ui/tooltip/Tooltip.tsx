import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { palette } from "shared/constants/palette";

import { Padding } from "../Padding";
import { Text } from "../text";

interface TooltipProps {
	text: string;
	visible: boolean;
	position?: UDim2;
	offsetX?: number;
	offsetY?: number;
	backgroundColor?: Color3;
	textColor?: Color3;
	maxWidth?: number;
	anchorPoint?: Vector2;
}

export function Tooltip({
	text,
	visible,
	position,
	backgroundColor = palette.black,
	textColor = palette.white,
	anchorPoint = new Vector2(0.5, 0.5),
	maxWidth = 200,
	offsetX = 0,
	offsetY = 0,
}: TooltipProps) {
	const rem = useRem();

	if (!visible || !position) return undefined;

	const cornerRadius = new UDim(0, rem(2));

	return (
		<Text
			backgroundColor={backgroundColor}
			backgroundTransparency={0.2}
			text={text}
			textSize={rem(2)}
			lineHeight={1.5}
			textColor={textColor}
			font={fonts.inter.medium}
			position={new UDim2(0, position.X.Offset + offsetX, 0, position.Y.Offset + offsetY)}
			size={new UDim2(0, rem(maxWidth), 0, 0)}
			textYAlignment="Center"
			textXAlignment="Left"
			automaticSize={Enum.AutomaticSize.Y}
			textWrapped
			cornerRadius={cornerRadius}
			anchorPoint={anchorPoint}
		>
			<Padding paddingX={rem(2)} paddingY={rem(1.5)} />
		</Text>
	);
}

import React from "@rbxts/react";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { sizes } from "shared/constants/sizes";

const TOOLTIP_BORDER_COLOR = Color3.fromRGB(136, 136, 136);

export interface TooltipBoxProps {
	/** Tooltip text content */
	text: string;
	/** Position in viewport/screen space (e.g. from AbsolutePosition) */
	position?: UDim2;
	/** Offset X from position (pass rem(N) for scaled pixels) */
	offsetX?: number;
	/** Offset Y from position (pass rem(N) for scaled pixels, negative = up) */
	offsetY?: number;
	/** Max width in pixels (default 350) */
	maxWidth?: number;
	/** Anchor point of the tooltip (default: bottom-center, so tooltip appears above) */
	anchorPoint?: Vector2;
}

export const TooltipBox = ({
	text,
	position = new UDim2(0, 0, 0, 0),
	offsetX = 0,
	offsetY = 0,
	maxWidth = 350,
	anchorPoint = new Vector2(0.5, 1),
}: TooltipBoxProps) => {
	const rem = useRem();

	const padding = new UDim(0, rem(1.25));
	const finalPosition = new UDim2(0, position.X.Offset + (offsetX ?? 0), 0, position.Y.Offset + (offsetY ?? 0));

	return (
		<Frame
			name="TooltipBox"
			size={new UDim2(0, rem(maxWidth, "pixel"), 0, 0)}
			position={finalPosition}
			anchorPoint={anchorPoint}
			automaticSize={Enum.AutomaticSize.Y}
			backgroundColor={palette.black}
			backgroundTransparency={0}
		>
			<uicorner CornerRadius={new UDim(0, rem(15, "pixel"))} />
			<uistroke
				Color={TOOLTIP_BORDER_COLOR}
				Transparency={0}
				Thickness={rem(sizes.borderWidthPx.xs, "pixel")}
				BorderStrokePosition={Enum.BorderStrokePosition.Inner}
			/>
			<uipadding PaddingLeft={padding} PaddingRight={padding} PaddingTop={padding} PaddingBottom={padding} />
			<Text
				text={text}
				textSize={rem(sizes.fontSize.xxs)}
				font={fonts.inter.regular}
				textColor={palette.white}
				textWrapped={true}
				automaticSize={Enum.AutomaticSize.XY}
			/>
		</Frame>
	);
};

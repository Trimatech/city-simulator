import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Padding } from "@rbxts-ui/components";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import assets from "shared/assets";
import { BORDER_GRADIENT, palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";
import { selectLocalAreaShare } from "shared/store/soldiers";

import { Minimap } from "./Minimap";
import { useMinimapRem } from "./utils";

const DARK_BORDER_THICKNESS = 0.2;
const BORDER_THICKNESS = 0.05;

export function MinimapArea() {
	const rem = useMinimapRem();
	const localAreaShare = useSelector(selectLocalAreaShare) ?? 0;

	const ownedText = `${math.floor(localAreaShare * 1000) / 10} % Owned`;

	return (
		<VStack
			size={UDim2.fromScale(0, 0)}
			verticalAlignment={Enum.VerticalAlignment.Bottom}
			horizontalAlignment={Enum.HorizontalAlignment.Center}
			spacing={rem(0.5)}
			automaticSize={Enum.AutomaticSize.XY}
		>
			<Frame automaticSize={Enum.AutomaticSize.XY} backgroundColor={palette.base} backgroundTransparency={0.15}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke Color={palette.darkBorderColor} Thickness={rem(DARK_BORDER_THICKNESS)} ZIndex={1} />
				<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
					<uigradient Color={BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				<Image
					image={assets.ui.patterns.dots_pattern}
					imageColor3={palette.white}
					imageTransparency={0.96}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(4), 0, rem(4))}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
				</Image>

				<Text
					font={fonts.inter.regular}
					text={ownedText}
					automaticSize={Enum.AutomaticSize.XY}
					textColor={palette.claimYellow}
					textSize={rem(1)}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={1}
				>
					<Padding paddingX={rem(1)} paddingY={rem(0.5)} />
				</Text>
			</Frame>
			<Minimap />
		</VStack>
	);
}

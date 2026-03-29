import React from "@rbxts/react";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const STAT_BG = Color3.fromRGB(124, 88, 0);
const STAT_BG_TRANSPARENCY = 0.3;
const STAT_BORDER_GRADIENT = new ColorSequence(Color3.fromRGB(255, 200, 50), Color3.fromRGB(172, 120, 23));
const STAT_OUTER_BORDER = Color3.fromRGB(61, 39, 19);
const STAT_LABEL_COLOR = Color3.fromRGB(246, 197, 78);

export interface WinStatCardProps {
	icon: string;
	label: string;
	value: string;
	layoutOrder?: number;
}

export function WinStatCard({ icon, label, value, layoutOrder }: WinStatCardProps) {
	const rem = useRem();
	const outerCorner = new UDim(0, rem(1));

	return (
		<Frame size={new UDim2(0, rem(9), 0, rem(6))} backgroundTransparency={1} layoutOrder={layoutOrder}>
			<Frame
				backgroundColor={STAT_BG}
				backgroundTransparency={STAT_BG_TRANSPARENCY}
				cornerRadius={outerCorner}
				size={new UDim2(1, 0, 1, 0)}
				clipsDescendants
			>
				<uistroke Color={STAT_OUTER_BORDER} Thickness={rem(0.25)} ZIndex={0} />
				<uistroke Color={palette.white} Thickness={rem(0.1)} ZIndex={1}>
					<uigradient Color={STAT_BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Dots pattern */}
				<Image
					image={assets.ui.patterns.dots_pattern}
					imageColor3={palette.white}
					imageTransparency={0.96}
					scaleType="Tile"
					tileSize={new UDim2(0, rem(4), 0, rem(4))}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uicorner CornerRadius={outerCorner} />
				</Image>

				<VStack
					spacing={rem(0.2)}
					horizontalAlignment={Enum.HorizontalAlignment.Center}
					verticalAlignment={Enum.VerticalAlignment.Center}
					size={new UDim2(1, 0, 1, 0)}
				>
					<Image image={icon} size={new UDim2(0, rem(2), 0, rem(2))} scaleType="Fit" />
					<Text
						font={fonts.fredokaOne.regular}
						text={value}
						textColor={palette.white}
						textSize={rem(1.5)}
						automaticSize={Enum.AutomaticSize.XY}
						layoutOrder={1}
					>
						<uistroke Color={palette.darkBorderColor} Transparency={0} Thickness={rem(0.1)} />
					</Text>
					<Text
						font={fonts.inter.bold}
						text={label}
						textColor={STAT_LABEL_COLOR}
						textSize={rem(0.9)}
						automaticSize={Enum.AutomaticSize.XY}
						layoutOrder={2}
					/>
				</VStack>
			</Frame>
		</Frame>
	);
}

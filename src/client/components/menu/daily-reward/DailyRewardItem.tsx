import React from "@rbxts/react";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { ShopItemTheme, shopItemThemes } from "../shop/ShopItem";

const LABEL_COLOR = Color3.fromRGB(250, 222, 77);

const SUBTITLE_STROKE_FROM = Color3.fromHex("#005794");
const SUBTITLE_STROKE_TO = Color3.fromHex("#000000");

interface DailyRewardItemProps {
	readonly title: string;
	readonly label: string;
	readonly icon?: string;
	readonly theme?: ShopItemTheme;
	readonly size?: UDim2;
	readonly layoutOrder?: number;
}

export function DailyRewardItem({
	title,
	label,
	icon,
	theme = shopItemThemes.blue,
	size,
	layoutOrder,
}: DailyRewardItemProps) {
	const rem = useRem();

	const cardSize = size ?? new UDim2(0, rem(16), 0, rem(24));
	const outerRadius = new UDim(0, rem(1.8));
	const whiteRadius = new UDim(0, rem(1.5));
	const innerRadius = new UDim(0, rem(1.2));
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const innerBorderGradient = new ColorSequence(theme.innerBorderFrom, theme.innerBorderTo);
	const titleStrokeGradient = new ColorSequence(SUBTITLE_STROKE_FROM, SUBTITLE_STROKE_TO);
	const labelStrokeGradient = new ColorSequence(SUBTITLE_STROKE_FROM, SUBTITLE_STROKE_TO);
	const strokeThickness = rem(0.15);
	const borderPad = new UDim(0, rem(0.3));
	const whitePad = new UDim(0, rem(0.3));

	return (
		<Frame size={cardSize} layoutOrder={layoutOrder} backgroundTransparency={1} name="DailyRewardItem">
			{/* Layer 1: Outer border */}
			<Frame
				backgroundColor={theme.outerBorderColor}
				cornerRadius={outerRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uipadding
					PaddingTop={borderPad}
					PaddingBottom={borderPad}
					PaddingLeft={borderPad}
					PaddingRight={borderPad}
				/>

				{/* Layer 2: White/cream band */}
				<Frame
					backgroundColor={theme.whiteBorderColor}
					cornerRadius={whiteRadius}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
				>
					<uipadding
						PaddingTop={whitePad}
						PaddingBottom={whitePad}
						PaddingLeft={whitePad}
						PaddingRight={whitePad}
					/>

					{/* Layer 3: Inner gradient area */}
					<Frame
						backgroundColor={palette.white}
						cornerRadius={innerRadius}
						size={new UDim2(1, 0, 1, 0)}
						backgroundTransparency={0}
						name="DailyRewardItemInner"
						clipsDescendants={true}
					>
						<uistroke Color={palette.white} Thickness={rem(0.15)}>
							<uigradient Color={innerBorderGradient} Rotation={90} />
						</uistroke>
						<uigradient Color={gradientSequence} Rotation={90} />

						{/* Rays texture overlay */}
						<Image
							image={assets.ui.shop_item_rays}
							size={new UDim2(1, 0, 1, 0)}
							imageTransparency={theme.raysTransparency}
							zIndex={1}
							scaleType="Crop"
							cornerRadius={innerRadius}
							imageColor3={theme.rayTint}
						/>
						<Image
							image={assets.ui.spot_glow}
							size={new UDim2(1, 0, 1, 0)}
							imageTransparency={theme.raysTransparency}
							zIndex={1}
							scaleType="Fit"
							imageColor3={theme.rayTint}
						/>

						{/* Icon */}
						{icon !== undefined && (
							<Image
								image={icon}
								size={new UDim2(0.8, 0, 0.55, 0)}
								position={new UDim2(0.5, 0, 0.45, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
								scaleType="Fit"
								zIndex={2}
							/>
						)}

						{/* Title — "DAY N" */}
						<Text
							text={title}
							font={fonts.fredokaOne.regular}
							textColor={palette.white}
							textSize={rem(2.4)}
							size={new UDim2(1, 0, 0, rem(2.8))}
							position={new UDim2(0, 0, 0.03, 0)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={palette.white}>
								<uigradient Color={titleStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>

						{/* Label — "N Crystal(s)" */}
						<Text
							text={label}
							font={fonts.fredokaOne.regular}
							textColor={LABEL_COLOR}
							textSize={rem(2)}
							size={new UDim2(1, 0, 0, rem(2.4))}
							position={new UDim2(0, 0, 0.85, 0)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={LABEL_COLOR}>
								<uigradient Color={labelStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>
					</Frame>
				</Frame>
			</Frame>
		</Frame>
	);
}

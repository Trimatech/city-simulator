import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { Text } from "client/ui/text";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { sizes } from "shared/constants/sizes";

import { ShopItemButton, ShopItemButtonTheme } from "./ShopItemButton";

export interface ShopItemTheme {
	readonly outerBorderColor: Color3;
	readonly whiteBorderColor: Color3;
	readonly innerBorderFrom: Color3;
	readonly innerBorderTo: Color3;
	readonly gradientFrom: Color3;
	readonly gradientTo: Color3;
	readonly titleStrokeFrom: Color3;
	readonly titleStrokeTo: Color3;
	readonly subtitleStrokeFrom: Color3;
	readonly subtitleStrokeTo: Color3;
	readonly labelStrokeFrom: Color3;
	readonly labelStrokeTo: Color3;
}

const SUBTITLE_STROKE_FROM = Color3.fromHex("#005794");
const SUBTITLE_STROKE_TO = Color3.fromHex("#000000");

export const shopItemThemes = {
	orange: {
		outerBorderColor: Color3.fromRGB(61, 39, 19),
		whiteBorderColor: Color3.fromRGB(255, 251, 241),
		innerBorderFrom: Color3.fromHex("#e3c855"),
		innerBorderTo: Color3.fromHex("#CC765F"),
		gradientFrom: Color3.fromRGB(249, 197, 29),
		gradientTo: Color3.fromRGB(230, 117, 83),
		titleStrokeFrom: SUBTITLE_STROKE_FROM,
		titleStrokeTo: SUBTITLE_STROKE_TO,
		subtitleStrokeFrom: SUBTITLE_STROKE_FROM,
		subtitleStrokeTo: SUBTITLE_STROKE_TO,
		labelStrokeFrom: SUBTITLE_STROKE_FROM,
		labelStrokeTo: SUBTITLE_STROKE_TO,
	},
	blue: {
		outerBorderColor: Color3.fromRGB(61, 39, 19),
		whiteBorderColor: Color3.fromRGB(255, 251, 241),
		innerBorderFrom: Color3.fromHex("#61c7ff"),
		innerBorderTo: Color3.fromHex("#4E72FF"),
		gradientFrom: Color3.fromRGB(91, 198, 255),
		gradientTo: Color3.fromRGB(65, 103, 255),
		titleStrokeFrom: SUBTITLE_STROKE_FROM,
		titleStrokeTo: SUBTITLE_STROKE_TO,
		subtitleStrokeFrom: SUBTITLE_STROKE_FROM,
		subtitleStrokeTo: SUBTITLE_STROKE_TO,
		labelStrokeFrom: SUBTITLE_STROKE_FROM,
		labelStrokeTo: SUBTITLE_STROKE_TO,
	},
} as const;

const SUBTITLE_COLOR = Color3.fromRGB(124, 211, 225);
const LABEL_COLOR = Color3.fromRGB(250, 222, 77);

interface ShopItemProps {
	readonly title: string;
	readonly subtitle?: string;
	readonly label?: string;
	readonly buttonText: string;
	readonly icon?: string;
	readonly theme?: ShopItemTheme;
	readonly buttonTheme?: ShopItemButtonTheme;
	readonly onButtonClick?: () => void;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly layoutOrder?: number;
}

export function ShopItem({
	title,
	subtitle,
	label,
	buttonText,
	icon,
	theme = shopItemThemes.orange,
	buttonTheme,
	onButtonClick,
	size,
	position,
	anchorPoint,
	layoutOrder,
}: ShopItemProps) {
	const rem = useRem();

	const cardSize = size ?? new UDim2(0, rem(20), 0, rem(24));
	const outerRadius = new UDim(0, rem(1.8));
	const whiteRadius = new UDim(0, rem(1.5));
	const innerRadius = new UDim(0, rem(1.2));
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const innerBorderGradient = new ColorSequence(theme.innerBorderFrom, theme.innerBorderTo);
	const titleStrokeGradient = new ColorSequence(theme.titleStrokeFrom, theme.titleStrokeTo);
	const subtitleStrokeGradient = new ColorSequence(theme.subtitleStrokeFrom, theme.subtitleStrokeTo);
	const labelStrokeGradient = new ColorSequence(theme.labelStrokeFrom, theme.labelStrokeTo);
	const strokeThickness = rem(0.15);
	const borderPad = new UDim(0, rem(0.35));
	const whitePad = new UDim(0, rem(0.65));

	return (
		<Frame
			size={cardSize}
			position={position}
			anchorPoint={anchorPoint}
			layoutOrder={layoutOrder}
			backgroundTransparency={1}
			name="ShopItem"
		>
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
						clipsDescendants={true}
						name="ShopItemInner"
					>
						<uistroke Color={palette.white} Thickness={rem(0.15)}>
							<uigradient Color={innerBorderGradient} Rotation={90} />
						</uistroke>
						<uigradient Color={gradientSequence} Rotation={90} />

						{/* Rays texture overlay */}
						<Image
							image={assets.ui.shop_item_rays}
							size={new UDim2(1, 0, 1, 0)}
							imageTransparency={0.45}
							zIndex={1}
							scaleType="Crop"
						/>

						{/* Icon */}
						{icon !== undefined && (
							<Image
								image={icon}
								size={new UDim2(0.95, 0, 0.65, 0)}
								position={new UDim2(0.5, 0, 0.42, 0)}
								anchorPoint={new Vector2(0.5, 0.5)}
								scaleType="Fit"
								zIndex={2}
							/>
						)}

						{/* Title */}
						<Text
							text={title}
							font={fonts.fredokaOne.regular}
							textColor={palette.white}
							textSize={rem(sizes.fontSize.large)}
							size={new UDim2(1, 0, 0, rem(2.5))}
							position={new UDim2(0, 0, 0, rem(0.75))}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={palette.white}>
								<uigradient Color={titleStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>

						{/* Subtitle */}
						{subtitle !== undefined && (
							<Text
								text={subtitle}
								font={fonts.fredokaOne.regular}
								textColor={SUBTITLE_COLOR}
								textSize={rem(1.1)}
								size={new UDim2(1, 0, 0, rem(1.5))}
								position={new UDim2(0, 0, 0, rem(3))}
								textXAlignment="Center"
								textYAlignment="Center"
								zIndex={3}
							>
								<uistroke Thickness={strokeThickness} Color={SUBTITLE_COLOR}>
									<uigradient Color={subtitleStrokeGradient} Rotation={90} />
								</uistroke>
							</Text>
						)}

						{/* Label */}
						{label !== undefined && (
							<Text
								text={label}
								font={fonts.fredokaOne.regular}
								textColor={LABEL_COLOR}
								textSize={rem(1.8)}
								size={new UDim2(1, 0, 0, rem(2.5))}
								anchorPoint={new Vector2(0, 1)}
								position={new UDim2(0, 0, 1, -rem(3.2))}
								textXAlignment="Center"
								textYAlignment="Center"
								zIndex={3}
							>
								<uistroke Thickness={strokeThickness} Color={LABEL_COLOR}>
									<uigradient Color={labelStrokeGradient} Rotation={90} />
								</uistroke>
							</Text>
						)}

						{/* Button */}
						<ShopItemButton
							text={buttonText}
							onClick={onButtonClick}
							theme={buttonTheme}
							size={new UDim2(0.7, 0, 0, rem(4))}
							position={new UDim2(0.5, 0, 1, -rem(0.5))}
							anchorPoint={new Vector2(0.5, 1)}
						/>
					</Frame>
				</Frame>
			</Frame>
		</Frame>
	);
}

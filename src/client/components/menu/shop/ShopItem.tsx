import React from "@rbxts/react";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
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
	readonly raysTransparency: number;
	readonly rayTint: Color3;
	readonly titleStrokeFrom: Color3;
	readonly titleStrokeTo: Color3;
	readonly subtitleStrokeFrom: Color3;
	readonly subtitleStrokeTo: Color3;
	readonly labelStrokeFrom: Color3;
	readonly labelStrokeTo: Color3;
}

const SUBTITLE_STROKE_FROM = palette.subtitleStrokeFrom;
const SUBTITLE_STROKE_TO = palette.subtitleStrokeTo;

export const shopItemThemes = {
	green: {
		outerBorderColor: Color3.fromRGB(61, 39, 19),
		whiteBorderColor: Color3.fromRGB(255, 251, 241),
		innerBorderFrom: Color3.fromHex("#97c186"),
		innerBorderTo: Color3.fromHex("#97c186"),
		gradientFrom: Color3.fromHex("#86c86f"),
		gradientTo: Color3.fromHex("#389c8f"),
		raysTransparency: 1,
		rayTint: Color3.fromRGB(134, 200, 111),
		titleStrokeFrom: SUBTITLE_STROKE_FROM,
		titleStrokeTo: SUBTITLE_STROKE_TO,
		subtitleStrokeFrom: SUBTITLE_STROKE_FROM,
		subtitleStrokeTo: SUBTITLE_STROKE_TO,
		labelStrokeFrom: SUBTITLE_STROKE_FROM,
		labelStrokeTo: SUBTITLE_STROKE_TO,
	},
	orange: {
		outerBorderColor: Color3.fromRGB(61, 39, 19),
		whiteBorderColor: Color3.fromRGB(255, 251, 241),
		innerBorderFrom: Color3.fromHex("#e3c855"),
		innerBorderTo: Color3.fromHex("#CC765F"),
		gradientFrom: Color3.fromRGB(249, 197, 29),
		gradientTo: Color3.fromRGB(230, 117, 83),
		raysTransparency: 0,
		rayTint: Color3.fromRGB(255, 225, 59),
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
		raysTransparency: 0.43,
		rayTint: Color3.fromRGB(0, 249, 251),
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
	readonly buttonIcon?: string;
	readonly icon?: string;
	readonly children?: React.ReactNode;
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
	buttonIcon,
	icon,
	children,
	theme = shopItemThemes.orange,
	buttonTheme,
	onButtonClick,
	size,
	position,
	anchorPoint,
	layoutOrder,
}: ShopItemProps) {
	const rem = useRem();

	const cardSize = size ?? new UDim2(0, rem(20), 0, rem(20));
	const outerRadius = new UDim(0, rem(1.8));
	const whiteRadius = new UDim(0, rem(1.5));
	const innerRadius = new UDim(0, rem(1.2));
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const innerBorderGradient = new ColorSequence(theme.innerBorderFrom, theme.innerBorderTo);
	const titleStrokeGradient = new ColorSequence(theme.titleStrokeFrom, theme.titleStrokeTo);
	const subtitleStrokeGradient = new ColorSequence(theme.subtitleStrokeFrom, theme.subtitleStrokeTo);
	const labelStrokeGradient = new ColorSequence(theme.labelStrokeFrom, theme.labelStrokeTo);
	const strokeThickness = rem(0.15);
	const borderPad = new UDim(0, rem(0.3));
	const whitePad = new UDim(0, rem(0.6));

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

						{/* Center content — either custom children or icon image */}
						{children !== undefined ? (
							<Frame
								size={new UDim2(1, 0, 1, 0)}
								backgroundTransparency={1}
								zIndex={2}
							>
								{children}
							</Frame>
						) : (
							icon !== undefined && (
								<Image
									image={icon}
									size={new UDim2(1.05, 0, 1.05, 0)}
									position={new UDim2(0.5, 0, 0.5, 0)}
									anchorPoint={new Vector2(0.5, 0.5)}
									scaleType="Fit"
									zIndex={2}
								/>
							)
						)}

						{/* Title — Figma: y=12 in 308h → ~3.9% */}
						<Text
							text={title}
							font={fonts.fredokaOne.regular}
							textColor={palette.white}
							textSize={rem(sizes.fontSize.large)}
							size={new UDim2(1, 0, 0, rem(2.2))}
							position={new UDim2(0, 0, 0.039, 0)}
							textXAlignment="Center"
							textYAlignment="Center"
							zIndex={3}
						>
							<uistroke Thickness={strokeThickness} Color={palette.white}>
								<uigradient Color={titleStrokeGradient} Rotation={90} />
							</uistroke>
						</Text>

						{/* Subtitle — Figma: y=44 in 308h → ~14.3% */}
						{subtitle !== undefined && (
							<Text
								text={subtitle}
								font={fonts.fredokaOne.regular}
								textColor={SUBTITLE_COLOR}
								textSize={rem(1.1)}
								size={new UDim2(1, 0, 0, rem(1.5))}
								position={new UDim2(0, 0, 0.143, 0)}
								textXAlignment="Center"
								textYAlignment="Center"
								zIndex={3}
							>
								<uistroke Thickness={strokeThickness} Color={SUBTITLE_COLOR}>
									<uigradient Color={subtitleStrokeGradient} Rotation={90} />
								</uistroke>
							</Text>
						)}

						{/* Label — Figma: y=235 in 308h → ~76.3% */}
						{label !== undefined && (
							<Text
								text={label}
								font={fonts.fredokaOne.regular}
								textColor={LABEL_COLOR}
								textSize={rem(1.8)}
								size={new UDim2(1, 0, 0, rem(2.2))}
								position={new UDim2(0, 0, 0.763, 0)}
								textXAlignment="Center"
								textYAlignment="Center"
								zIndex={3}
							>
								<uistroke Thickness={strokeThickness} Color={LABEL_COLOR}>
									<uigradient Color={labelStrokeGradient} Rotation={90} />
								</uistroke>
							</Text>
						)}

						{/* Button — Figma: y=287 in 308h → ~93.2%, overflows bottom */}
						<ShopItemButton
							text={buttonText}
							icon={buttonIcon}
							onClick={onButtonClick}
							theme={buttonTheme}
							size={new UDim2(0.685, 0, 0.214, 0)}
							position={new UDim2(0.5, 0, 0.932, 0)}
							anchorPoint={new Vector2(0.5, 0)}
						/>
					</Frame>
				</Frame>
			</Frame>
		</Frame>
	);
}

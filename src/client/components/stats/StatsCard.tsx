import React, { MutableRefObject, useEffect, useMemo } from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

export interface StatsCardColorStyle {
	/** Inner background color (semi-transparent) */
	readonly innerBackground: Color3;
	readonly innerBackgroundTransparency: number;
	/** Inner border gradient (top → bottom) */
	readonly innerBorderGradient: ColorSequence;
	/** Label text color */
	readonly labelColor: Color3;
}

export const STATS_CARD_STYLES = {
	gold: {
		innerBackground: Color3.fromRGB(124, 88, 0),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(255, 142, 35), // #FF8E23
			Color3.fromRGB(172, 95, 23), // #AC5F17
		),
		labelColor: Color3.fromRGB(246, 197, 78), // #f6c54e
	},
	teal: {
		innerBackground: Color3.fromRGB(1, 100, 106),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(81, 249, 202), // #51F9CA
			Color3.fromRGB(48, 172, 138), // #30AC8A
		),
		labelColor: Color3.fromRGB(246, 197, 78),
	},
	red: {
		innerBackground: Color3.fromRGB(75, 0, 0),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(249, 81, 81), // #F95151
			Color3.fromRGB(172, 53, 53), // #AC3535
		),
		labelColor: Color3.fromRGB(246, 197, 78),
	},
	green: {
		innerBackground: Color3.fromRGB(27, 73, 0),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(81, 249, 168), // #51F9A8
			Color3.fromRGB(48, 172, 116), // #30AC74
		),
		labelColor: Color3.fromRGB(246, 197, 78),
	},
	purple: {
		innerBackground: Color3.fromRGB(60, 63, 90),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(137, 81, 249), // #8951F9
			Color3.fromRGB(95, 56, 172), // #5F38AC
		),
		labelColor: Color3.fromRGB(246, 197, 78),
	},
	cyan: {
		innerBackground: Color3.fromRGB(0, 60, 90),
		innerBackgroundTransparency: 0.3,
		innerBorderGradient: new ColorSequence(
			Color3.fromRGB(81, 220, 255), // #51DCFF
			Color3.fromRGB(48, 148, 200), // #3094C8
		),
		labelColor: Color3.fromRGB(150, 230, 255), // #96E6FF
	},
} as const satisfies Record<string, StatsCardColorStyle>;

export type StatsCardStyleName = keyof typeof STATS_CARD_STYLES;

interface StatsCardProps {
	readonly onClick?: () => void;
	readonly image: string;
	readonly label: string;
	readonly value: string;
	readonly colorStyle: StatsCardStyleName;
	readonly enabled: boolean;
	readonly order: number;
	readonly iconRef?: MutableRefObject<Frame | undefined>;
}

const OUTER_BORDER_COLOR = Color3.fromRGB(61, 39, 19); // #3d2713
const OUTER_CORNER_RADIUS = 1;
const INNER_CORNER_RADIUS = 0.75;
const INNER_PADDING = 0.2;

const CARD_HEIGHT = 4;
const CARD_EMOJI_WIDTH = 2.5;
const CARD_PADDING = 0.75;
const CARD_MARGIN = 0.75;
const CARD_CANVAS_MARGIN = 3;

export function StatsCard({ onClick, image, label, value, colorStyle, enabled, order, iconRef }: StatsCardProps) {
	const style = STATS_CARD_STYLES[colorStyle];

	const rem = useRem();
	const [transparency, transparencyMotion] = useMotion(1);
	const [textWidth, textWidthMotion] = useMotion({ label: 0, value: 0 });

	const size = useMemo(() => {
		return textWidth.map(({ label, value }) => {
			const content = math.max(label, value);
			const width = CARD_EMOJI_WIDTH + CARD_PADDING + 2 * CARD_MARGIN + 2 * INNER_PADDING;
			return new UDim2(0, rem(width) + content, 0, rem(CARD_HEIGHT));
		});
	}, [rem]);

	useEffect(() => {
		transparencyMotion.spring(enabled ? 0 : 0.75, springs.slow);
	}, [enabled]);

	const outerCorner = new UDim(0, rem(OUTER_CORNER_RADIUS));

	return (
		<ReactiveButton2 onClick={onClick} backgroundTransparency={1} size={size} layoutOrder={order}>
			<Transition
				groupTransparency={transparency}
				size={new UDim2(1, rem(2 * CARD_CANVAS_MARGIN), 1, rem(2 * CARD_CANVAS_MARGIN))}
				position={new UDim2(0, rem(-CARD_CANVAS_MARGIN), 0, rem(-CARD_CANVAS_MARGIN))}
			>
				<uipadding
					PaddingTop={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingBottom={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingLeft={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingRight={new UDim(0, rem(CARD_CANVAS_MARGIN))}
				/>

				{/* Outer frame with border */}
				<Frame
					ref={iconRef}
					backgroundColor={style.innerBackground}
					backgroundTransparency={style.innerBackgroundTransparency}
					cornerRadius={outerCorner}
					size={new UDim2(1, 0, 1, 0)}
					clipsDescendants
				>
					<uistroke Color={OUTER_BORDER_COLOR} Thickness={rem(0.3)} ZIndex={0} />

					<uistroke Color={palette.white} Thickness={rem(0.1)} ZIndex={1}>
						<uigradient Color={style.innerBorderGradient} Rotation={90} />
					</uistroke>

					{/* Background pattern */}
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

					{/* Icon image */}
					<Image
						image={image}
						size={new UDim2(0, rem(CARD_EMOJI_WIDTH), 0, rem(CARD_EMOJI_WIDTH))}
						position={new UDim2(0, rem(CARD_MARGIN), 0.5, rem(-CARD_EMOJI_WIDTH / 2))}
					/>

					{/* Label text */}
					<Text
						font={fonts.inter.bold}
						text={label}
						textColor={style.labelColor}
						textTransparency={0.05}
						textSize={rem(1)}
						textXAlignment="Left"
						textYAlignment="Bottom"
						position={new UDim2(0, rem(CARD_MARGIN + CARD_EMOJI_WIDTH + CARD_PADDING), 0.5, -rem(0.25))}
						change={{
							TextBounds: (rbx) => {
								textWidthMotion.spring({ label: rbx.TextBounds.X });
							},
						}}
					/>

					{/* Value text */}
					<Text
						font={fonts.inter.regular}
						text={value}
						textColor={palette.white}
						textTransparency={0.05}
						textSize={rem(1.5)}
						textXAlignment="Left"
						textYAlignment="Top"
						position={new UDim2(0, rem(CARD_MARGIN + CARD_EMOJI_WIDTH + CARD_PADDING), 0.5, -rem(0.25))}
						change={{
							TextBounds: (rbx) => {
								textWidthMotion.spring({ value: rbx.TextBounds.X });
							},
						}}
					/>
				</Frame>
			</Transition>
		</ReactiveButton2>
	);
}

import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack, Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { POWERUP_BUTTON_STYLES, POWERUP_OUTER_BORDER_COLOR, PowerupId } from "shared/constants/powerups";
import { remotes } from "shared/remotes";

interface Props {
	readonly id: PowerupId;
	readonly emoji: string;
	readonly label: string;
	readonly enabled: boolean;
	readonly order: number;
	readonly price: number;
}

const CIRCLE_SIZE = 5;
const TOOLTIP_WIDTH = 7;
const OUTER_STROKE_THICKNESS = 0.2;
const INNER_STROKE_THICKNESS = 0.15;

export function BuyPowerup({ id, emoji, label, enabled, order, price }: Props) {
	const rem = useRem();
	const style = POWERUP_BUTTON_STYLES[id];

	const HEIGHT = rem(CIRCLE_SIZE);
	const WIDTH = HEIGHT;
	const FULL_WIDTH = WIDTH + rem(TOOLTIP_WIDTH);

	const [showTooltip, setShowTooltip] = useState(false);
	const [transparency, transparencyMotion] = useMotion(1);
	const [bgColor, bgColorMotion] = useMotion(style.backgroundColor);
	const [size, sizeMotion] = useMotion(new UDim2(0, WIDTH, 0, HEIGHT));

	useEffect(() => {
		transparencyMotion.spring(enabled ? 0 : 0.4, springs.slow);
	}, [enabled]);

	useEffect(() => {
		bgColorMotion.spring(enabled ? style.backgroundColor : palette.overlay2, springs.slow);
	}, [enabled, style.backgroundColor]);

	useEffect(() => {
		sizeMotion.spring(new UDim2(0, showTooltip ? FULL_WIDTH : WIDTH, 0, HEIGHT), springs.gentle);
	}, [showTooltip, WIDTH, FULL_WIDTH, HEIGHT]);

	const fullRound = new UDim(1, 0);

	return (
		<ReactiveButton2
			onClick={() => remotes.powerups.use.fire(id)}
			enabled={enabled}
			backgroundTransparency={1}
			size={size}
			layoutOrder={order}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			anchorPoint={new Vector2(1, 0.5)}
		>
			<Transition groupTransparency={transparency} size={new UDim2(1, 0, 1, 0)}>
				{/* Outer frame — colored background with dual strokes */}
				<Frame
					backgroundColor={bgColor}
					backgroundTransparency={0}
					cornerRadius={fullRound}
					size={new UDim2(1, 0, 1, 0)}
					clipsDescendants
				>
					{/* Dark blue outer stroke */}
					<uistroke Color={POWERUP_OUTER_BORDER_COLOR} Thickness={rem(OUTER_STROKE_THICKNESS)} ZIndex={0} />

					{/* Inner gradient stroke */}
					<uistroke Color={palette.white} Thickness={rem(INNER_STROKE_THICKNESS)} ZIndex={1}>
						<uigradient Color={style.borderGradient} Rotation={90} />
					</uistroke>

					{/* Dots pattern overlay */}
					<Image
						image={assets.ui.patterns.dots_pattern}
						imageColor3={palette.white}
						imageTransparency={0.96}
						scaleType="Tile"
						tileSize={new UDim2(0, rem(4), 0, rem(4))}
						size={new UDim2(1, 0, 1, 0)}
					>
						<uicorner CornerRadius={fullRound} />
					</Image>

					{/* Content */}
					<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} ZIndex={2}>
						<HStack clipsDescendants={false} horizontalAlignment={Enum.HorizontalAlignment.Right}>
							{showTooltip ? (
								<HStack spacing={rem(1)} size={new UDim2(0, rem(TOOLTIP_WIDTH), 0, HEIGHT)}>
									<uipadding PaddingLeft={new UDim(0, rem(3))} />
									<Text
										text={label}
										size={new UDim2(1, 0, 0, rem(1))}
										font={fonts.inter.bold}
										textColor={palette.crust}
										textSize={rem(1.5)}
										textXAlignment="Center"
										textYAlignment="Center"
										richText
									/>
									<Text size={new UDim2(1, 0, 0, rem(1))} text={`🔮 ${price}`} textSize={rem(1)} />
								</HStack>
							) : undefined}

							{/* Circle with emoji */}
							<Frame size={new UDim2(0, rem(CIRCLE_SIZE), 0, rem(CIRCLE_SIZE))}>
								<Text
									text={emoji}
									textScaled
									anchorPoint={new Vector2(0.5, 0.5)}
									size={new UDim2(0, rem(2.5), 0, rem(2.5))}
									position={new UDim2(0.5, 0, 0.5, 0)}
								/>
							</Frame>
						</HStack>
					</frame>
				</Frame>
			</Transition>
		</ReactiveButton2>
	);
}

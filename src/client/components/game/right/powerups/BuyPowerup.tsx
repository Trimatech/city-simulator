import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack, Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette, textStrokeGradient } from "shared/constants/palette";
import { POWERUP_BUTTON_STYLES, POWERUP_OUTER_BORDER_COLOR, PowerupId } from "shared/constants/powerups";
import { remotes } from "shared/remotes";
import { brighten } from "shared/utils/color-utils";

interface Props {
	readonly id: PowerupId;
	readonly label: string;
	readonly enabled: boolean;
	readonly order: number;
	readonly price: number;
}

const POWERUP_ICONS: Record<PowerupId, string> = {
	nuclearExplosion: assets.ui.powerups.nuclear,
	laserBeam: assets.ui.powerups.laser2,
	shield: assets.ui.powerups.shield,
	tower: assets.ui.powerups.tower,
	turbo: assets.ui.powerups.speed,
};

const CIRCLE_SIZE = 5;
const TOOLTIP_WIDTH = 7;
const OUTER_STROKE_THICKNESS = 0.2;
const INNER_STROKE_THICKNESS = 0.15;

export function BuyPowerup({ id, label, enabled, order, price }: Props) {
	const rem = useRem();
	const style = POWERUP_BUTTON_STYLES[id];

	const HEIGHT = rem(CIRCLE_SIZE);
	const WIDTH = HEIGHT;
	const FULL_WIDTH = WIDTH + rem(TOOLTIP_WIDTH);

	const [showTooltip, setShowTooltip] = useState(false);

	const [size, sizeMotion] = useMotion(new UDim2(0, WIDTH, 0, HEIGHT));

	// useEffect(() => {
	// 	transparencyMotion.spring(enabled ? 0 : 0.4, springs.slow);
	// }, [enabled]);

	// useEffect(() => {
	// 	bgColorMotion.spring(enabled ? style.backgroundColor : palette.overlay2, springs.slow);
	// }, [enabled, style.backgroundColor]);

	useEffect(() => {
		sizeMotion.spring(new UDim2(0, showTooltip ? FULL_WIDTH : WIDTH, 0, HEIGHT), springs.gentle);
	}, [showTooltip, WIDTH, FULL_WIDTH, HEIGHT]);

	const fullRound = new UDim(1, 0);

	const iconSize = rem(4);

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
			<Transition groupTransparency={0} size={new UDim2(1, 0, 1, 0)}>
				{/* Outer frame — colored background with dual strokes */}
				<Frame
					backgroundColor={style.backgroundColor}
					backgroundTransparency={0}
					cornerRadius={fullRound}
					size={new UDim2(1, 0, 1, 0)}
					clipsDescendants
				>
					{/* Background gradient */}
					<uigradient Color={style.backgroundGradient} Rotation={60} />

					{/* Dark blue outer stroke */}
					<uistroke Color={POWERUP_OUTER_BORDER_COLOR} Thickness={rem(OUTER_STROKE_THICKNESS)} ZIndex={0} />

					{/* Inner gradient stroke */}
					<uistroke Color={palette.white} Thickness={rem(INNER_STROKE_THICKNESS)} ZIndex={1}>
						<uigradient Color={style.borderGradient} Rotation={90} />
					</uistroke>

					<Image
						image={assets.ui.patterns.water_noise_pattern}
						size={new UDim2(1, 0, 1, 0)}
						imageTransparency={0.5}
						scaleType="Tile"
						imageColor3={brighten(style.backgroundColor, 1)}
						tileSize={new UDim2(0, rem(40), 0, rem(40))}
					>
						<uicorner CornerRadius={fullRound} />
					</Image>

					{/* Content */}

					<HStack clipsDescendants={false} horizontalAlignment={Enum.HorizontalAlignment.Right}>
						{showTooltip ? (
							<HStack spacing={rem(1)} size={new UDim2(0, rem(TOOLTIP_WIDTH), 0, HEIGHT)} wraps>
								<uipadding PaddingLeft={new UDim(0, rem(1))} />
								<Text
									text={label}
									size={new UDim2(1, 0, 0, rem(1))}
									font={fonts.fredokaOne.regular}
									textColor={palette.white}
									textSize={rem(1.5)}
									textXAlignment="Center"
									textYAlignment="Center"
									richText
								>
									<uistroke Thickness={rem(0.15)} Color={palette.white}>
										<uigradient Color={textStrokeGradient} Rotation={90} />
									</uistroke>
								</Text>
								<Text
									size={new UDim2(1, 0, 0, rem(1))}
									font={fonts.fredokaOne.regular}
									textColor={enabled ? palette.green : palette.red1}
									text={`🔮 ${price}`}
									textSize={rem(1)}
								>
									<uistroke Thickness={rem(0.15)} Color={palette.white}>
										<uigradient Color={textStrokeGradient} Rotation={90} />
									</uistroke>
								</Text>
							</HStack>
						) : undefined}

						{/* Circle with icon */}
						<Frame size={new UDim2(0, rem(CIRCLE_SIZE), 0, rem(CIRCLE_SIZE))}>
							<Image
								image={POWERUP_ICONS[id]}
								anchorPoint={new Vector2(0.5, 0.5)}
								size={new UDim2(0, iconSize, 0, iconSize)}
								position={new UDim2(0.5, 0, 0.5, 0)}
								backgroundTransparency={1}
							/>
						</Frame>
					</HStack>
				</Frame>
			</Transition>
		</ReactiveButton2>
	);
}

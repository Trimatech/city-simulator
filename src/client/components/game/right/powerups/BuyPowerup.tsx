import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack, Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
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

const BURST_EMIT_DURATION = 0.25;
const BURST_LIFETIME_MAX = 2.5;

const ORB_FOUNTAIN_CONFIG: ParticleEmitter2DConfig = {
	rate: 50,
	lifetime: new NumberRange(1.5, BURST_LIFETIME_MAX),
	speed: new NumberRange(300, 650),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 14),
		new NumberSequenceKeypoint(0.35, 18),
		new NumberSequenceKeypoint(1, 5),
	]),
	texture: assets.ui.icons.orb,
	acceleration: new NumberRange(0),
	spreadAngle: new NumberRange(-55, 55),
	rotation: new NumberRange(0, 0),
	rotSpeed: new NumberRange(0, 0),
	transparency: new NumberSequence([
		new NumberSequenceKeypoint(0, 0.05),
		new NumberSequenceKeypoint(0.5, 0.15),
		new NumberSequenceKeypoint(1, 1),
	]),
	color: new ColorSequence(new Color3(1, 1, 1)),
	zOffset: 10,
	gravityStrength: 900,
};

export function BuyPowerup({ id, label, enabled, order, price }: Props) {
	const rem = useRem();
	const style = POWERUP_BUTTON_STYLES[id];

	const HEIGHT = rem(CIRCLE_SIZE);
	const WIDTH = HEIGHT;
	const FULL_WIDTH = WIDTH + rem(TOOLTIP_WIDTH);

	const [showTooltip, setShowTooltip] = useState(false);
	const [burstPos, setBurstPos] = useState<Vector2 | undefined>();
	const [burstKey, setBurstKey] = useState(0);
	const frameRef = useRef<Frame>();
	const cleanupRef = useRef<thread>();

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
			onClick={() => {
				remotes.powerups.use.fire(id);
				if (enabled) {
					const mousePos = UserInputService.GetMouseLocation();
					const framePos = frameRef.current?.AbsolutePosition ?? new Vector2(0, 0);
					setBurstPos(new Vector2(mousePos.X - framePos.X, mousePos.Y - framePos.Y));
					setBurstKey((prev) => prev + 1);
					if (cleanupRef.current) task.cancel(cleanupRef.current);
					cleanupRef.current = task.delay(BURST_EMIT_DURATION + BURST_LIFETIME_MAX + 0.5, () =>
						setBurstPos(undefined),
					);
				}
			}}
			enabled={enabled}
			backgroundTransparency={1}
			size={size}
			layoutOrder={order}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			anchorPoint={new Vector2(1, 0.5)}
		>
			{burstPos !== undefined && (
				<Frame
					key={`burst-${burstKey}`}
					position={new UDim2(0, burstPos.X, 0, burstPos.Y)}
					size={new UDim2(0, 1, 0, 1)}
					backgroundTransparency={1}
					zIndex={10}
				>
					<Particles
						config={ORB_FOUNTAIN_CONFIG}
						size={new UDim2(0, 1, 0, 1)}
						emitDuration={BURST_EMIT_DURATION}
					/>
				</Frame>
			)}
			<Transition groupTransparency={0} size={new UDim2(1, 0, 1, 0)}>
				{/* Outer frame — colored background with dual strokes */}
				<Frame
					ref={frameRef}
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
								<HStack
									size={new UDim2(1, 0, 0, rem(1))}
									backgroundTransparency={1}
									spacing={rem(0.25)}
									verticalAlignment={Enum.VerticalAlignment.Center}
									horizontalAlignment={Enum.HorizontalAlignment.Center}
								>
									<Image
										image={assets.ui.icons.orb}
										size={new UDim2(0, rem(1), 0, rem(1))}
										position={new UDim2(0, 0, 0.5, 0)}
										anchorPoint={new Vector2(0, 0.5)}
										scaleType="Fit"
										zIndex={1}
									/>
									<Text
										size={new UDim2(0, 0, 1, 0)}
										automaticSize={Enum.AutomaticSize.X}
										font={fonts.fredokaOne.regular}
										textColor={enabled ? palette.green : palette.red1}
										text={tostring(price)}
										textSize={rem(1)}
										textXAlignment="Center"
										textYAlignment="Center"
									>
										<uistroke Thickness={rem(0.15)} Color={palette.white}>
											<uigradient Color={textStrokeGradient} Rotation={90} />
										</uistroke>
									</Text>
								</HStack>
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

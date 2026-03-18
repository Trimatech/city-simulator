import { useKeyPress, useMotion } from "@rbxts/pretty-react-hooks";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { GuiService, UserInputService } from "@rbxts/services";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack, Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion as useMotionMapped } from "client/hooks";
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
	readonly children?: React.Element;
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

const BURST_LIFETIME_MAX = 2.5;

const ORDER_TO_KEY = ["One", "Two", "Three", "Four", "Five"] as const;

function getBurstEmitDuration(price: number): number {
	return math.clamp(price * 0.01, 0.15, 0.75);
}

function getOrbFountainConfig(price: number): ParticleEmitter2DConfig {
	const rate = math.clamp(price * 4, 20, 400);

	return {
		rate,
		lifetime: new NumberRange(1.5, BURST_LIFETIME_MAX),
		speed: new NumberRange(80, 200),
		size: new NumberSequence([
			new NumberSequenceKeypoint(0, 14),
			new NumberSequenceKeypoint(0.35, 18),
			new NumberSequenceKeypoint(1, 5),
		]),
		texture: assets.ui.icons.orb,
		acceleration: new NumberRange(2),
		spreadAngle: new NumberRange(-60, 60),
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
}

export function BuyPowerup({ id, label, enabled, order, price, children }: Props) {
	const rem = useRem();
	const style = POWERUP_BUTTON_STYLES[id];

	const HEIGHT = rem(CIRCLE_SIZE);
	const WIDTH = HEIGHT;
	const FULL_WIDTH = WIDTH + rem(TOOLTIP_WIDTH);

	const [showTooltip, setShowTooltip] = useState(false);
	const [bursts, setBursts] = useState<Array<{ key: number; pos: Vector2 }>>([]);
	const burstCounter = useRef(0);
	const frameRef = useRef<Frame>();
	const wrapperRef = useRef<Frame>();
	const prevEnabled = useRef(enabled);
	const [showShimmer, setShowShimmer] = useState(false);

	const [size, sizeMotion] = useMotion(new UDim2(0, WIDTH, 0, HEIGHT));
	const [scale, scaleMotion] = useMotion(1);
	const [shimmerGradientOffset, shimmerMotion] = useMotionMapped(-150, (v: number) => new Vector2(v, 0));

	// Bounce + shimmer when powerup becomes affordable
	useEffect(() => {
		if (enabled && !prevEnabled.current) {
			// Scale bounce
			scaleMotion.spring(1.25, springs.bubbly);
			task.delay(0.15, () => scaleMotion.spring(1, springs.bubbly));

			// Shimmer sweep via gradient offset
			setShowShimmer(true);
			shimmerMotion.spring(0, { tension: 1000, friction: 100 });
			task.delay(0, () => shimmerMotion.spring(1, { tension: 120, friction: 20 }));
			task.delay(1, () => {
				setShowShimmer(false);
				shimmerMotion.spring(0, { tension: 1000, friction: 100 });
			});
		}
		prevEnabled.current = enabled;
	}, [enabled]);

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

	const orbFountainConfig = useMemo(() => getOrbFountainConfig(price), [price]);
	const burstEmitDuration = useMemo(() => getBurstEmitDuration(price), [price]);

	const emitBurst = useCallback(
		(pos: Vector2) => {
			burstCounter.current += 1;
			const key = burstCounter.current;
			setBursts((prev) => [...prev, { key, pos }]);
			task.delay(burstEmitDuration + BURST_LIFETIME_MAX + 0.5, () =>
				setBursts((prev) => prev.filter((b) => b.key !== key)),
			);
		},
		[burstEmitDuration],
	);

	const getButtonCenter = useCallback((): Vector2 => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return new Vector2(0, 0);
		const absSize = wrapper.AbsoluteSize;
		return new Vector2(absSize.X / 2, absSize.Y / 2);
	}, []);

	const shortcutKey = ORDER_TO_KEY[5 - order];
	const pressed = useKeyPress(shortcutKey ? [shortcutKey] : []);

	useEffect(() => {
		if (pressed) {
			remotes.powerups.use.fire(id);
			if (enabled) {
				emitBurst(getButtonCenter());
			}
		}
	}, [pressed, id]);

	return (
		<Frame
			ref={wrapperRef}
			backgroundTransparency={1}
			size={new UDim2(0, 0, 0, HEIGHT)}
			layoutOrder={order}
			clipsDescendants={false}
		>
			<uiscale Scale={scale} />
			{bursts.map((burst) => (
				<Frame
					key={`burst-${burst.key}`}
					position={new UDim2(0, burst.pos.X, 0, burst.pos.Y)}
					size={new UDim2(0, 1, 0, 1)}
					backgroundTransparency={1}
					zIndex={10}
				>
					<Particles
						config={orbFountainConfig}
						size={new UDim2(0, 1, 0, 1)}
						emitDuration={burstEmitDuration}
					/>
				</Frame>
			))}
			<ReactiveButton2
				onClick={() => {
					remotes.powerups.use.fire(id);
					if (enabled) {
						const mousePos = UserInputService.GetMouseLocation();
						const [guiInset] = GuiService.GetGuiInset();
						const wrapperPos = wrapperRef.current?.AbsolutePosition ?? new Vector2(0, 0);
						const pos = new Vector2(
							mousePos.X - guiInset.X - wrapperPos.X,
							mousePos.Y - guiInset.Y - wrapperPos.Y,
						);
						emitBurst(pos);
					}
				}}
				enabled={enabled}
				backgroundTransparency={1}
				size={size}
				anchorPoint={new Vector2(1, 0)}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
			>
				<Transition groupTransparency={0} size={new UDim2(1, 0, 1, 0)}>
					{/* Outer frame — colored background with dual strokes */}
					<Frame
						ref={frameRef}
						backgroundColor={palette.white}
						backgroundTransparency={0.05}
						cornerRadius={fullRound}
						size={new UDim2(1, 0, 1, 0)}
						clipsDescendants
					>
						{/* Background gradient */}
						<uigradient Color={style.backgroundGradient} Rotation={60} />

						{/* Dark blue outer stroke */}
						<uistroke
							Color={POWERUP_OUTER_BORDER_COLOR}
							Thickness={rem(OUTER_STROKE_THICKNESS)}
							ZIndex={0}
						/>

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

						{/* Shimmer sweep overlay — gradient offset animates across */}
						{showShimmer && (
							<Frame
								key="shimmer"
								size={new UDim2(1, 0, 1, 0)}
								backgroundTransparency={0}
								backgroundColor={palette.white}
								cornerRadius={fullRound}
								zIndex={5}
							>
								<uigradient
									Transparency={
										new NumberSequence([
											new NumberSequenceKeypoint(0, 1),
											new NumberSequenceKeypoint(0.35, 0.6),
											new NumberSequenceKeypoint(0.5, 0.5),
											new NumberSequenceKeypoint(0.65, 0.6),
											new NumberSequenceKeypoint(1, 1),
										])
									}
									Offset={shimmerGradientOffset}
									Rotation={15}
								/>
							</Frame>
						)}

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

								{children}
							</Frame>
						</HStack>
					</Frame>
				</Transition>
			</ReactiveButton2>
		</Frame>
	);
}

import { useKeyPress, useMotion } from "@rbxts/pretty-react-hooks";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { GuiService, UserInputService } from "@rbxts/services";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { HStack, Transition } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useDeadlineTimer } from "client/hooks/use-deadline-timer";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette, textStrokeGradient } from "shared/constants/palette";
import {
	POWERUP_BUTTON_STYLES,
	POWERUP_DURATIONS,
	POWERUP_OUTER_BORDER_COLOR,
	PowerupId,
} from "shared/constants/powerups";
import { remotes } from "shared/remotes";
import { selectLocalShieldActiveUntil, selectLocalTurboActiveUntil } from "shared/store/soldiers";
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

export function BuyPowerup({ id, label, enabled, order, price }: Props) {
	const rem = useRem();
	const style = POWERUP_BUTTON_STYLES[id];

	const turboActiveUntil = useSelector(selectLocalTurboActiveUntil);
	const isTurboActive = id === "turbo" && turboActiveUntil > 0;
	const { secondsLeft: turboSecondsLeft } = useDeadlineTimer(turboActiveUntil, POWERUP_DURATIONS.turbo);

	const shieldActiveUntil = useSelector(selectLocalShieldActiveUntil);
	const isShieldActive = id === "shield" && shieldActiveUntil > 0;
	const { secondsLeft: shieldSecondsLeft } = useDeadlineTimer(shieldActiveUntil, POWERUP_DURATIONS.shield);

	const isTimerActive = isTurboActive || isShieldActive;
	const timerSecondsLeft = isTurboActive ? turboSecondsLeft : shieldSecondsLeft;

	const HEIGHT = rem(CIRCLE_SIZE);
	const WIDTH = HEIGHT;
	const FULL_WIDTH = WIDTH + rem(TOOLTIP_WIDTH);

	const [showTooltip, setShowTooltip] = useState(false);
	const [bursts, setBursts] = useState<Array<{ key: number; pos: Vector2 }>>([]);
	const burstCounter = useRef(0);
	const frameRef = useRef<Frame>();
	const wrapperRef = useRef<Frame>();

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
						backgroundColor={style.backgroundColor}
						backgroundTransparency={0}
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

								{isTimerActive && (
									<Text
										position={new UDim2(0, 0, 0, 0)}
										size={new UDim2(1, 0, 1, 0)}
										text={timerSecondsLeft}
										font={fonts.fredokaOne.regular}
										textColor={palette.white}
										textSize={rem(3)}
										textXAlignment="Center"
										textYAlignment="Center"
										zIndex={5}
									>
										<uistroke Thickness={rem(0.1)} Color={palette.white}>
											<uigradient Color={textStrokeGradient} Rotation={90} />
										</uistroke>
									</Text>
								)}
							</Frame>
						</HStack>
					</Frame>
				</Transition>
			</ReactiveButton2>
		</Frame>
	);
}

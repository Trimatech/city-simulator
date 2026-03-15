import Object from "@rbxts/object-utils";
import React, { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Frame } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { Particles } from "client/ui/Particles/Particles";
import { ParticleEmitter2DConfig } from "client/ui/Particles/Particles.interfaces";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { POWERUP_COLORS, POWERUP_PRICES, PowerupId } from "shared/constants/powerups";
import { cornerRadiusFull } from "shared/constants/sizes";
import { remotes } from "shared/remotes";
import { selectLocalOrbs } from "shared/store/soldiers";
import { brighten } from "shared/utils/color-utils";

const SORTED_THRESHOLDS = (Object.entries(POWERUP_PRICES) as Array<[PowerupId, number]>).sort(([, a], [, b]) => a < b);

const WASTED_ORBS_BURST_LIFETIME = 3.5;

const WASTED_ORBS_CONFIG: ParticleEmitter2DConfig = {
	rate: 20,
	lifetime: new NumberRange(2, WASTED_ORBS_BURST_LIFETIME),
	speed: new NumberRange(15, 40),
	size: new NumberSequence([
		new NumberSequenceKeypoint(0, 8),
		new NumberSequenceKeypoint(0.3, 10),
		new NumberSequenceKeypoint(1, 4),
	]),
	texture: assets.ui.icons.orb,
	acceleration: new NumberRange(0),
	spreadAngle: new NumberRange(-30, 30),
	rotation: new NumberRange(0, 360),
	rotSpeed: new NumberRange(-30, 30),
	transparency: new NumberSequence([
		new NumberSequenceKeypoint(0, 0),
		new NumberSequenceKeypoint(0.6, 0.3),
		new NumberSequenceKeypoint(1, 1),
	]),
	color: new ColorSequence([
		new ColorSequenceKeypoint(0, Color3.fromRGB(255, 60, 60)),
		new ColorSequenceKeypoint(0.5, Color3.fromRGB(200, 30, 30)),
		new ColorSequenceKeypoint(1, Color3.fromRGB(120, 10, 10)),
	]),
	zOffset: 5,
	gravityStrength: 80,
};

const OUTER_BORDER_COLOR = Color3.fromHex("#0e2a4e");
const BG_COLOR = Color3.fromHex("#2a65a0");

const OUTER_STROKE_GRADIENT = new ColorSequence(Color3.fromHex("#0E2A4E"), Color3.fromHex("#0E2A4E"));

const INNER_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#1A4E80")),
	new ColorSequenceKeypoint(0.48, Color3.fromHex("#2A65A0")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#2E73B8")),
]);

interface Props {
	readonly anchorPoint?: Vector2;
	readonly position?: UDim2;
	readonly heightRem?: number;
}

export function OrbsMeter({ position = new UDim2(0, 0, 0, 0) }: Props) {
	const rem = useRem();
	const orbs = useSelector(selectLocalOrbs) ?? 0;

	const [wasteBursts, setWasteBursts] = useState<Array<{ key: number; emitDuration: number }>>([]);
	const burstCounter = useRef(0);

	useEffect(() => {
		const disconnect = remotes.client.orbsWasted.connect((amount) => {
			burstCounter.current += 1;
			const key = burstCounter.current;
			const emitDuration = math.clamp(amount * 0.1, 0.15, 0.5);

			setWasteBursts((prev) => [...prev, { key, emitDuration }]);

			task.delay(emitDuration + WASTED_ORBS_BURST_LIFETIME + 0.5, () => {
				setWasteBursts((prev) => prev.filter((b) => b.key !== key));
			});
		});

		return () => disconnect();
	}, []);

	const progressColor = useMemo(() => {
		let color = palette.blue;
		for (const [id, price] of SORTED_THRESHOLDS) {
			if (orbs >= price) {
				color = POWERUP_COLORS[id];
			}
		}
		return color;
	}, [orbs]);

	const progress = math.clamp(math.max(orbs, 15) / SOLDIER_MAX_ORBS, 0, 1);

	const [fillPosition, fillMotion] = useMotion(progress, (value) => new UDim2(0.5, 0, 1 - value, 0));

	useEffect(() => {
		fillMotion.spring(progress, springs.gentle);
	}, [progress]);

	const width = rem(1.5);
	const meterSize = new UDim2(0, width, 1, 0);
	const thickness = rem(0.2);

	const fillStrokeGradient = useMemo(() => {
		return new ColorSequence([
			new ColorSequenceKeypoint(0, progressColor),
			new ColorSequenceKeypoint(0.75, progressColor),
			new ColorSequenceKeypoint(1, brighten(progressColor, 0.3)),
		]);
	}, [progressColor]);

	const fillBgGradient = useMemo(() => {
		return new ColorSequence([
			new ColorSequenceKeypoint(0, progressColor),
			new ColorSequenceKeypoint(0.75, brighten(progressColor, 0.8)),
			new ColorSequenceKeypoint(1, brighten(progressColor, 0.3)),
		]);
	}, [progressColor]);

	return (
		<Frame
			name="OrbsMeterOuter"
			backgroundColor={OUTER_BORDER_COLOR}
			backgroundTransparency={0}
			size={meterSize}
			position={position}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="OrbsMeter" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={BG_COLOR}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke
					Color={Color3.fromHex("#ffffff")}
					Thickness={thickness}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
				>
					<uigradient Color={OUTER_STROKE_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Filled portion — full size, slides via Position so roundness is preserved */}
				<canvasgroup
					key="OrbsFill"
					Position={fillPosition}
					Size={new UDim2(1, -thickness * 3, 1, 0)}
					AnchorPoint={new Vector2(0.5, 0)}
					BackgroundColor3={palette.white}
					ZIndex={2}
				>
					<uigradient Color={fillBgGradient} Rotation={90} />
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.2)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={fillStrokeGradient} Rotation={-90} />
					</uistroke>
				</canvasgroup>

				<canvasgroup
					key="OrbsFillInner"
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Size={new UDim2(1, -thickness * 2, 1, -thickness * 2)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Transparency={1}
					ZIndex={1}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.2)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={INNER_STROKE_GRADIENT} Rotation={90} />
					</uistroke>
				</canvasgroup>
			</canvasgroup>

			{/* Price markers */}
			{(Object.entries(POWERUP_PRICES) as Array<[PowerupId, number]>).map(([id, price]) => {
				const fraction = math.clamp(price / SOLDIER_MAX_ORBS, 0, 1);
				const y = 1 - fraction;
				const markerGradient = new ColorSequence([
					new ColorSequenceKeypoint(0, OUTER_BORDER_COLOR),
					new ColorSequenceKeypoint(0.5, POWERUP_COLORS[id]),
					new ColorSequenceKeypoint(1, OUTER_BORDER_COLOR),
				]);
				return (
					<Frame
						key={`price-${price}`}
						backgroundColor={palette.white}
						backgroundTransparency={0}
						size={new UDim2(1, 0, 0, rem(0.2))}
						anchorPoint={new Vector2(0.5, 0.5)}
						position={new UDim2(0.5, 0, y, 0)}
						zIndex={3}
					>
						<uigradient Color={markerGradient} Rotation={0} />
					</Frame>
				);
			})}

			{/* Wasted orbs burst effect when picking up orbs while full */}
			{wasteBursts.map((burst) => (
				<Frame
					key={`waste-burst-${burst.key}`}
					position={new UDim2(0.5, 0, 0, 0)}
					size={new UDim2(0, width, 0, 1)}
					anchorPoint={new Vector2(0.5, 1)}
					backgroundTransparency={1}
					zIndex={5}
				>
					<Particles
						config={WASTED_ORBS_CONFIG}
						size={new UDim2(1, 0, 0, 1)}
						emitDuration={burst.emitDuration}
					/>
				</Frame>
			))}
		</Frame>
	);
}

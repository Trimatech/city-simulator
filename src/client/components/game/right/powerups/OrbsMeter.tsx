import Object from "@rbxts/object-utils";
import React, { useEffect, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Frame } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { POWERUP_COLORS, POWERUP_PRICES, PowerupId } from "shared/constants/powerups";
import { cornerRadiusFull } from "shared/constants/sizes";
import { selectLocalOrbs } from "shared/store/soldiers";
import { brighten } from "shared/utils/color-utils";

const SORTED_THRESHOLDS = (Object.entries(POWERUP_PRICES) as Array<[PowerupId, number]>).sort(([, a], [, b]) => a < b);

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
		</Frame>
	);
}

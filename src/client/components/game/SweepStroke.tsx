import React, { useEffect } from "@rbxts/react";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

const DEFAULT_INITIAL_ROTATION = 5;
const DEFAULT_ROTATION_DURATION = 0.9;
const DEFAULT_FINAL_TRANSPARENCY = 0.1;

interface SweepStrokeProps {
	readonly color: Color3;
	readonly trigger: unknown;
	readonly thickness?: number;
	readonly initialRotation?: number;
	readonly rotationDuration?: number;
	readonly finalTransparency?: number;
}

export function SweepStroke({
	color,
	trigger,
	thickness = 0.2,
	initialRotation = DEFAULT_INITIAL_ROTATION,
	rotationDuration = DEFAULT_ROTATION_DURATION,
	finalTransparency = DEFAULT_FINAL_TRANSPARENCY,
}: SweepStrokeProps) {
	const rem = useRem();
	const [sweepRotation, sweepRotationMotion] = useMotion(initialRotation);
	const [sweepTransparency, sweepTransparencyMotion] = useMotion(1);

	useEffect(() => {
		sweepRotationMotion.set(initialRotation);
		sweepRotationMotion.tween(initialRotation + 160, {
			time: rotationDuration,
			style: Enum.EasingStyle.Sine,
		});
		sweepTransparencyMotion.set(1);
		sweepTransparencyMotion.tween(finalTransparency, { time: 0.3 });
		task.delay(rotationDuration - 0.5, () => {
			sweepTransparencyMotion.tween(1, { time: 0.5 });
		});
	}, [trigger]);

	return (
		<uistroke Color={color} Transparency={sweepTransparency} Thickness={rem(thickness)} ZIndex={3}>
			<uigradient
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, color),
						new ColorSequenceKeypoint(0.5, palette.white),
						new ColorSequenceKeypoint(1, color),
					])
				}
				Transparency={
					new NumberSequence([
						new NumberSequenceKeypoint(0, 1),
						new NumberSequenceKeypoint(0.3, 0.3),
						new NumberSequenceKeypoint(0.5, 0),
						new NumberSequenceKeypoint(0.7, 0.3),
						new NumberSequenceKeypoint(1, 1),
					])
				}
				Rotation={sweepRotation}
			/>
		</uistroke>
	);
}

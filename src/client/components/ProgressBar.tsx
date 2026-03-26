import { composeBindings } from "@rbxts/pretty-react-hooks";
import React, { useMemo } from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { cornerRadiusFull } from "shared/constants/sizes";
import { brighten, darken } from "shared/utils/color-utils";

const DEFAULT_ACCENT = Color3.fromHex("#08f0fe");

function deriveColors(accent: Color3) {
	const outerBorder = darken(accent, 0.85);
	const bg = darken(accent, 0.5);

	return {
		outerBorder,
		bg,
		fill: accent,
		outerStrokeGradient: new ColorSequence(outerBorder, outerBorder),
		fillStrokeGradient: new ColorSequence([
			new ColorSequenceKeypoint(0, accent),
			new ColorSequenceKeypoint(0.5, accent),
			new ColorSequenceKeypoint(1, brighten(accent, 1.2)),
		]),
		innerStrokeGradient: new ColorSequence([
			new ColorSequenceKeypoint(0, darken(accent, 0.65)),
			new ColorSequenceKeypoint(0.48, darken(accent, 0.5)),
			new ColorSequenceKeypoint(1, darken(accent, 0.4)),
		]),
	};
}

export interface ProgressBarProps {
	/** Progress value from 0 to 1 */
	progress: number | React.Binding<number>;
	/** Accent color — all bar colors are derived from this */
	accent?: Color3;
	/** Height in pixels */
	height?: number;
}

export const ProgressBar = ({ progress, accent, height = 28 }: ProgressBarProps) => {
	const rem = useRem();
	const colors = useMemo(() => deriveColors(accent ?? DEFAULT_ACCENT), [accent]);

	const fillPosition = composeBindings(progress, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0.5, 0);
	});

	const thickness = rem(0.2);

	return (
		<Frame
			name="ProgressBarOuter"
			backgroundColor={colors.outerBorder}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.4))}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="ProgressBar" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={colors.bg}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke
					Color={Color3.fromHex("#ffffff")}
					Thickness={thickness}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
				>
					<uigradient Color={colors.outerStrokeGradient} Rotation={90} />
				</uistroke>

				{/* Filled portion — full size, slides via Position so roundness is preserved */}
				<canvasgroup
					key="ProgressFill"
					Position={fillPosition}
					Size={new UDim2(1, 0, 1, -thickness * 3)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={colors.fill}
					ZIndex={2}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.2)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={colors.fillStrokeGradient} Rotation={0} />
					</uistroke>
				</canvasgroup>

				<canvasgroup
					key="ProgressFillInner"
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
						<uigradient Color={colors.innerStrokeGradient} Rotation={90} />
					</uistroke>
				</canvasgroup>
			</canvasgroup>
		</Frame>
	);
};

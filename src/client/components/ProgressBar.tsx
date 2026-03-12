import { composeBindings } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { cornerRadiusFull } from "shared/constants/sizes";

const OUTER_BORDER_COLOR = Color3.fromHex("#0e2a4e");
const BG_COLOR = Color3.fromHex("#2a65a0");
const FILL_COLOR = Color3.fromHex("#08f0fe");

// Gradient stroke for the inner progress bar border (top → bottom)
const OUTER_STROKE_GRADIENT = new ColorSequence(Color3.fromHex("#0E2A4E"), Color3.fromHex("#0E2A4E"));

// Gradient stroke for the fill bar border (top → bottom)00F0FF

const FILL_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#00F0FF")),
	new ColorSequenceKeypoint(0.75, Color3.fromHex("#00F0FF")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#82F8FF")),
]);

const INNER_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#1A4E80")),
	new ColorSequenceKeypoint(0.48, Color3.fromHex("#2A65A0")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#2E73B8")),
]);

export interface ProgressBarProps {
	/** Progress value from 0 to 1 */
	progress: number | React.Binding<number>;
	/** Height in pixels */
	height?: number;
}

export const ProgressBar = ({ progress, height = 28 }: ProgressBarProps) => {
	const rem = useRem();

	const fillPosition = composeBindings(progress, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0.5, 0);
	});

	const thickness = rem(0.2);

	return (
		<Frame
			name="ProgressBarOuter"
			backgroundColor={OUTER_BORDER_COLOR}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.4))}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="ProgressBar" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={BG_COLOR}>
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
					key="ProgressFill"
					Position={fillPosition}
					Size={new UDim2(1, 0, 1, -thickness * 3)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={FILL_COLOR}
					ZIndex={2}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.2)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={FILL_STROKE_GRADIENT} Rotation={0} />
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
						<uigradient Color={INNER_STROKE_GRADIENT} Rotation={90} />
					</uistroke>
				</canvasgroup>
			</canvasgroup>
		</Frame>
	);
};

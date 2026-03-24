import { composeBindings } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";

const OUTER_BORDER_COLOR = Color3.fromRGB(119, 119, 119);
const BG_COLOR = Color3.fromRGB(40, 40, 40);
const FILL_COLOR = Color3.fromRGB(246, 197, 78);

const OUTER_STROKE_GRADIENT = new ColorSequence(Color3.fromRGB(119, 119, 119), Color3.fromRGB(100, 100, 100));

const FILL_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, FILL_COLOR),
	new ColorSequenceKeypoint(0.64, FILL_COLOR),
	new ColorSequenceKeypoint(1, Color3.fromRGB(255, 220, 100)),
]);

const INNER_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromRGB(80, 60, 20)),
	new ColorSequenceKeypoint(0.48, Color3.fromRGB(120, 90, 30)),
	new ColorSequenceKeypoint(1, Color3.fromRGB(150, 115, 40)),
]);

interface MilestoneProgressBarProps {
	readonly progress: number;
	readonly percentText: string;
}

export function MilestoneProgressBar({ progress, percentText }: MilestoneProgressBarProps) {
	const rem = useRem();

	const [progressValue, progressMotion] = useMotion(0);

	useEffect(() => {
		progressMotion.spring(progress, springs.gentle);
	}, [progress]);

	// Fill slides along X: positionX = p - 1 moves fill left to right
	const fillPosition = composeBindings(progressValue, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0.5, 0);
	});

	const height = rem(0.85);
	const thickness = rem(0.1);

	return (
		<Frame
			name="MilestoneProgressBarOuter"
			backgroundColor={OUTER_BORDER_COLOR}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.2))}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="MilestoneProgressBar" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={BG_COLOR}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke
					Color={palette.black}
					Thickness={rem(0.15)}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					ZIndex={1}
				/>
				<uistroke
					Color={Color3.fromHex("#ffffff")}
					Thickness={thickness}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					ZIndex={2}
				>
					<uigradient Color={OUTER_STROKE_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Filled portion — full width, slides via Position X so roundness is preserved */}
				<canvasgroup
					key="MilestoneFill"
					Position={fillPosition}
					Size={new UDim2(1, 0, 1, -thickness * 2)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={FILL_COLOR}
					ZIndex={2}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.1)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={FILL_STROKE_GRADIENT} Rotation={0} />
					</uistroke>
				</canvasgroup>

				<canvasgroup
					key="MilestoneFillInner"
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Size={new UDim2(1, -thickness * 2, 1, -thickness * 2)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Transparency={1}
					ZIndex={1}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.1)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={INNER_STROKE_GRADIENT} Rotation={90} />
					</uistroke>
				</canvasgroup>

				{/* Percentage label */}
				<Text
					font={fonts.fredokaOne.regular}
					text={percentText}
					textColor={palette.white}
					textSize={rem(0.7)}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={1}
					zIndex={3}
				/>
			</canvasgroup>
		</Frame>
	);
}

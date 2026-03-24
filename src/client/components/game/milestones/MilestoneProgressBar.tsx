import { composeBindings } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useMemo } from "@rbxts/react";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";
import { brighten, darken } from "shared/utils/color-utils";

const BG_COLOR = Color3.fromRGB(40, 40, 40);

function buildGradients(color: Color3) {
	const outerStroke = new ColorSequence(darken(color, 0.6), darken(color, 0.7));

	const fillStroke = new ColorSequence([
		new ColorSequenceKeypoint(0, color),
		new ColorSequenceKeypoint(0.5, color),
		new ColorSequenceKeypoint(1, brighten(color, 0.9)),
	]);

	const innerStroke = new ColorSequence([
		new ColorSequenceKeypoint(0, darken(color, 0.5)),
		new ColorSequenceKeypoint(0.48, darken(color, 0.3)),
		new ColorSequenceKeypoint(1, darken(color, 0.15)),
	]);

	return { outerStroke, fillStroke, innerStroke };
}

interface MilestoneProgressBarProps {
	readonly progress: number;
	readonly percentText: string;
	readonly color: Color3;
}

export function MilestoneProgressBar({ progress, percentText, color }: MilestoneProgressBarProps) {
	const rem = useRem();

	const [progressValue, progressMotion] = useMotion(0);

	useEffect(() => {
		progressMotion.spring(progress, springs.gentle);
	}, [progress]);

	// Fill slides along X: positionX = p - 1 moves fill left to right
	const fillPosition = composeBindings(progressValue, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0.5, 0);
	});

	const gradients = useMemo(() => buildGradients(color), [color]);

	const height = rem(0.85);
	const thickness = rem(0.1);

	return (
		<Frame
			name="MilestoneProgressBarOuter"
			backgroundColor={darken(color, 0.6)}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.2))}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="MilestoneProgressBar" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={BG_COLOR}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke
					Color={palette.black}
					Thickness={rem(0.1)}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					ZIndex={1}
				/>
				{/* <uistroke
					Color={Color3.fromHex("#ffffff")}
					Thickness={thickness}
					BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					ZIndex={2}
				>
					<uigradient Color={gradients.outerStroke} Rotation={90} />
				</uistroke> */}

				{/* Filled portion — full width, slides via Position X so roundness is preserved */}
				<canvasgroup
					key="MilestoneFill"
					Position={fillPosition}
					Size={new UDim2(1, 0, 1, -thickness * 2)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={color}
					ZIndex={2}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.1)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={gradients.fillStroke} Rotation={0} />
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
						<uigradient Color={gradients.innerStroke} Rotation={90} />
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
				>
					<uistroke Color={palette.black} Thickness={rem(0.05)} />
				</Text>
			</canvasgroup>
		</Frame>
	);
}

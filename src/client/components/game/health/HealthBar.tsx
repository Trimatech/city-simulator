import { composeBindings } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Frame } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";
import { selectLocalHealth, selectLocalMaxHealth } from "shared/store/soldiers";

const OUTER_BORDER_COLOR = Color3.fromHex("#000000");
const BG_COLOR = Color3.fromHex("#2aa044");
const FILL_COLOR = Color3.fromHex("#08FE41");

const OUTER_STROKE_GRADIENT = new ColorSequence(Color3.fromHex("#00E135"), Color3.fromHex("#00D331"));

const FILL_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, FILL_COLOR),
	new ColorSequenceKeypoint(0.64, FILL_COLOR),
	new ColorSequenceKeypoint(1, Color3.fromHex("#88FF20")),
]);

const INNER_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#1a6b1d")),
	new ColorSequenceKeypoint(0.48, Color3.fromHex("#2aa044")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#34b852")),
]);

export function HealthBar() {
	const rem = useRem();
	const health = useSelector(selectLocalHealth) ?? 0;
	const maxHealth = useSelector(selectLocalMaxHealth) ?? 0;

	const progress = math.clamp(math.max(health, 0) / math.max(maxHealth, 1), 0, 1);

	const [progressValue, progressMotion] = useMotion(progress);

	useEffect(() => {
		progressMotion.spring(progress, springs.gentle);
	}, [progress]);

	// Fill slides along X: positionX = p - 1 moves fill left to right
	const fillPosition = composeBindings(progressValue, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0.5, 0);
	});

	const height = rem(1.5);
	const thickness = rem(0.2);

	return (
		<Frame
			name="HealthBarOuter"
			backgroundColor={OUTER_BORDER_COLOR}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.4))}
			cornerRadius={cornerRadiusFull}
		>
			<canvasgroup key="HealthBar" Size={new UDim2(1, 0, 1, 0)} BackgroundColor3={BG_COLOR}>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke
					Color={palette.black}
					Thickness={rem(0.3)}
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
					key="HealthFill"
					Position={fillPosition}
					Size={new UDim2(1, 0, 1, -thickness * 2)}
					AnchorPoint={new Vector2(0, 0.5)}
					BackgroundColor3={FILL_COLOR}
					ZIndex={2}
				>
					<uicorner CornerRadius={cornerRadiusFull} />
					{/* <uigradient Color={FILL_BG_GRADIENT} Rotation={90} /> */}
					<uistroke
						Color={Color3.fromHex("#ffffff")}
						Thickness={rem(0.2)}
						BorderStrokePosition={Enum.BorderStrokePosition.Outer}
					>
						<uigradient Color={FILL_STROKE_GRADIENT} Rotation={0} />
					</uistroke>
				</canvasgroup>

				<canvasgroup
					key="HealthFillInner"
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
}

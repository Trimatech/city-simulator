import { composeBindings } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { Frame } from "@rbxts-ui/primitives";
import { palette } from "shared/constants/palette";

const progressBarGradient = new ColorSequence(Color3.fromHex("#4FACFE"), Color3.fromHex("#00F2FE"));

export interface ProgressBarProps {
	/** Progress value from 0 to 1 */
	progress: number | React.Binding<number>;
	/** Height in pixels */
	height?: number;
}

const style1 = {
	progressBar: {
		backgroundColor: palette.blue2,
		backgroundTransparency: 0,
		borderColor: palette.white,
		borderTransparency: 0,
		borderThickness: 0,
	},
	progressFill: {
		backgroundColor: palette.white,
		backgroundTransparency: 0,
		gradient: progressBarGradient,
	},
};

export const ProgressBar = ({ progress, height = 0.5 }: ProgressBarProps) => {
	const rem = useRem();
	const style = style1;

	const fillPosition = composeBindings(progress, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0, 0);
	});

	return (
		<canvasgroup
			key="ProgressBar"
			Size={new UDim2(1, 0, 0, height)}
			BackgroundColor3={style.progressBar.backgroundColor}
			BackgroundTransparency={style.progressBar.backgroundTransparency}
			GroupTransparency={0}
		>
			<uicorner CornerRadius={new UDim(1, 0)} />
			<uistroke
				Color={style.progressBar.borderColor}
				Transparency={style.progressBar.borderTransparency}
				Thickness={rem(style.progressBar.borderThickness, "pixel")}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
			/>

			{/* Filled portion — full size, slides via Position so roundness is preserved */}
			<Frame
				name="ProgressFill"
				position={fillPosition}
				size={UDim2.fromScale(1, 1)}
				backgroundColor={style.progressFill.backgroundColor}
				backgroundTransparency={style.progressFill.backgroundTransparency}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
				<uigradient Color={style.progressFill.gradient} Rotation={0} />
			</Frame>
		</canvasgroup>
	);
};

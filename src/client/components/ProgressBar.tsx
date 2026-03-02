import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { palette } from "shared/constants/palette";

const progressBarGradient = new ColorSequence(Color3.fromHex("#4FACFE"), Color3.fromHex("#00F2FE"));

export interface ProgressBarProps {
	/** Current value */
	current: number;
	/** Target value */
	target: number;
	/** Height in rem units (default 0.5) */
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

export const ProgressBar = ({ current, target, height = 0.5 }: ProgressBarProps) => {
	const progress = math.clamp(current / target, 0, 1);
	const rem = useRem();
	const style = style1;

	return (
		<Frame
			name="ProgressBar"
			size={new UDim2(1, 0, 0, height)}
			backgroundColor={style.progressBar.backgroundColor}
			backgroundTransparency={style.progressBar.backgroundTransparency}
		>
			<uicorner CornerRadius={new UDim(1, 0)} />
			<uistroke
				Color={style.progressBar.borderColor}
				Transparency={style.progressBar.borderTransparency}
				Thickness={rem(style.progressBar.borderThickness, "pixel")}
				BorderStrokePosition={Enum.BorderStrokePosition.Inner}
			/>

			{/* Filled portion */}
			<Frame
				name="ProgressFill"
				size={new UDim2(progress, 0, 1, 0)}
				backgroundColor={style.progressFill.backgroundColor}
				backgroundTransparency={style.progressFill.backgroundTransparency}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
				<uigradient Color={style.progressFill.gradient} Rotation={0} />
			</Frame>
		</Frame>
	);
};

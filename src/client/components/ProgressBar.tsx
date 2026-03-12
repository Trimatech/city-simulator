import { composeBindings } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/hooks";
import { cornerRadiusFull } from "shared/constants/sizes";

const OUTER_BORDER_COLOR = Color3.fromHex("#0e2a4e");
const BG_COLOR = Color3.fromHex("#2a65a0");
const INNER_BORDER_COLOR = Color3.fromHex("#1a4e80");
const FILL_COLOR = Color3.fromHex("#08f0fe");
const FILL_BORDER_COLOR = Color3.fromHex("#00f0ff");

export interface ProgressBarProps {
	/** Progress value from 0 to 1 */
	progress: number | React.Binding<number>;
	/** Height in pixels */
	height?: number;
}

export const ProgressBar = ({ progress, height = 28 }: ProgressBarProps) => {
	const rem = useRem();

	const fillPosition = composeBindings(progress, (p: number) => {
		return new UDim2(math.clamp(p, 0, 1) - 1, 0, 0, 0);
	});

	return (
		<Frame
			name="ProgressBarOuter"
			backgroundColor={OUTER_BORDER_COLOR}
			backgroundTransparency={0}
			size={new UDim2(1, 0, 0, height + rem(0.4))}
			cornerRadius={cornerRadiusFull}
		>
			<uipadding
				PaddingTop={new UDim(0, rem(0.2))}
				PaddingBottom={new UDim(0, rem(0.2))}
				PaddingLeft={new UDim(0, rem(0.2))}
				PaddingRight={new UDim(0, rem(0.2))}
			/>
			<canvasgroup
				key="ProgressBar"
				Size={new UDim2(1, 0, 1, 0)}
				BackgroundColor3={BG_COLOR}
				BackgroundTransparency={0}
				GroupTransparency={0}
			>
				<uicorner CornerRadius={cornerRadiusFull} />
				<uistroke Color={INNER_BORDER_COLOR} Thickness={rem(0.2)} />

				{/* Filled portion — full size, slides via Position so roundness is preserved */}
				<canvasgroup
					key="ProgressFill"
					Position={fillPosition}
					Size={UDim2.fromScale(1, 1)}
					BackgroundColor3={FILL_COLOR}
					BackgroundTransparency={0}
					GroupTransparency={0}
				>
					<uicorner CornerRadius={new UDim(1, 0)} />
					<uistroke Color={FILL_BORDER_COLOR} Thickness={rem(0.2)} />
				</canvasgroup>
			</canvasgroup>
		</Frame>
	);
};

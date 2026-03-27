import React from "@rbxts/react";
import { Button } from "@rbxts-ui/components";
import { Frame, Image } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const BORDER_THICKNESS = 3;

export interface TooltipButtonProps {
	/** Called when the button is clicked */
	onClick: () => void;
	/** Called when the mouse enters (for hover tooltips on desktop) */
	onMouseEnter?: () => void;
	/** Called when the mouse leaves (for hover tooltips on desktop) */
	onMouseLeave?: () => void;
	/** Whether the button is enabled */
	enabled?: boolean;
}

export const TooltipButton = ({ onClick, onMouseEnter, onMouseLeave, enabled = true }: TooltipButtonProps) => {
	const rem = useRem();
	const iconSize = 0.5;

	return (
		<Button
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			active={enabled}
			backgroundTransparency={1}
			size={new UDim2(1, 0, 1, 0)}
		>
			<Frame backgroundColor={palette.dark} backgroundTransparency={0} size={new UDim2(1, 0, 1, 0)}>
				<uicorner CornerRadius={new UDim(0, rem(8, "pixel"))} />
				<uistroke
					Color={palette.white}
					Transparency={0.5}
					Thickness={rem(BORDER_THICKNESS, "pixel")}
					BorderStrokePosition={Enum.BorderStrokePosition.Inner}
				/>
			</Frame>
			<Image
				image={assets.ui.icons.orb}
				anchorPoint={new Vector2(0.5, 0.5)}
				size={new UDim2(iconSize, 0, iconSize, 0)}
				position={new UDim2(0.5, 0, 0.5, 0)}
				imageTransparency={enabled ? 0 : 0.7}
				scaleType="Fit"
				backgroundTransparency={1}
			/>
		</Button>
	);
};

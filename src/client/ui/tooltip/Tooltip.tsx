import React, { useEffect, useRef, useState } from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { UserInputService } from "@rbxts/services";
import { Button } from "@rbxts-ui/components";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";

import { usePortal } from "../../providers/PortalProvider";
import { TooltipBox } from "./TooltipBox";
import { TooltipButton } from "./TooltipButton";

const BUTTON_SIZE = 41;
const TOOLTIP_OFFSET = 20;

export interface TooltipProps {
	/** Tooltip text - shows on hover or click */
	tooltipText: string;
	/** Called when the button is clicked (in addition to toggling tooltip) */
	onClick?: () => void;
	/** Whether the button is enabled */
	enabled?: boolean;
	position?: UDim2;
	anchorPoint?: Vector2;
	/** Custom trigger element instead of default info icon. Used for decorative icons with tooltip. */
	trigger?: React.ReactNode;
	/** Size when using custom trigger */
	size?: UDim2;
	/** When true, don't play click sound (for decorative/info-only tooltips) */
	silent?: boolean;
	zIndex?: number;
}

export const Tooltip = ({
	tooltipText,
	onClick,
	enabled = true,
	position = new UDim2(0, 0, 0, 0),
	anchorPoint = new Vector2(0, 0),
	trigger,
	size: customSize,
	silent = false,
	zIndex = 1,
}: TooltipProps) => {
	const rem = useRem();
	const { portalRef } = usePortal();
	const buttonRef = useRef<Frame>(undefined as unknown as Frame);
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPos, setTooltipPos] = useState<UDim2>(new UDim2(0, 0, 0, 0));

	const tooltipOffset = rem(TOOLTIP_OFFSET, "pixel");

	useEffect(() => {
		if (showTooltip && buttonRef.current && portalRef.current) {
			const absPos = buttonRef.current.AbsolutePosition;
			const absSize = buttonRef.current.AbsoluteSize;
			const portalPos = portalRef.current.AbsolutePosition;
			const rightX = absPos.X + absSize.X - portalPos.X - tooltipOffset;
			const topY = absPos.Y - portalPos.Y + absSize.Y - tooltipOffset;
			setTooltipPos(UDim2.fromOffset(rightX, topY));
		}
	}, [showTooltip, portalRef]);

	// When tooltip is open, listen for any click/touch to close it (no auto-hide)
	useEffect(() => {
		if (!showTooltip) return;

		const connection = UserInputService.InputBegan.Connect((input) => {
			if (
				input.UserInputType === Enum.UserInputType.MouseButton1 ||
				input.UserInputType === Enum.UserInputType.Touch
			) {
				setShowTooltip(false);
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [showTooltip]);

	const handleMouseEnter = () => {
		if (enabled) setShowTooltip(true);
	};

	const handleMouseLeave = () => {
		if (enabled) setShowTooltip(false);
	};

	const handleClick = () => {
		if (enabled && !showTooltip) {
			if (!silent) playSound(assets.sounds.button_down);
			setShowTooltip(true);
			onClick?.();
		}
		// Close is handled by the global click/touch listener - avoids race with toggle
	};

	const size = customSize ?? new UDim2(0, rem(BUTTON_SIZE, "pixel"), 0, rem(BUTTON_SIZE, "pixel"));

	const useHover = !UserInputService.TouchEnabled;

	return (
		<Frame
			ref={buttonRef}
			size={size}
			backgroundTransparency={1}
			position={position}
			anchorPoint={anchorPoint}
			zIndex={zIndex}
		>
			{trigger !== undefined ? (
				<Button
					onClick={handleClick}
					onMouseEnter={useHover ? handleMouseEnter : undefined}
					onMouseLeave={useHover ? handleMouseLeave : undefined}
					active={enabled}
					backgroundTransparency={1}
					size={new UDim2(1, 0, 1, 0)}
				>
					{trigger}
				</Button>
			) : (
				<TooltipButton
					onClick={handleClick}
					onMouseEnter={useHover ? handleMouseEnter : undefined}
					onMouseLeave={useHover ? handleMouseLeave : undefined}
					enabled={enabled}
				/>
			)}
			{showTooltip &&
				portalRef.current &&
				createPortal(
					<TooltipBox
						text={tooltipText}
						position={tooltipPos}
						offsetX={rem(0.5)}
						offsetY={0}
						maxWidth={350}
						anchorPoint={new Vector2(0, 0)}
					/>,
					portalRef.current,
				)}
		</Frame>
	);
};

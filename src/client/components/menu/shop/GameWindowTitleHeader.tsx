import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { MainButton, ShopButtonIcon } from "../../../ui/MainButton";
import { HeaderText } from "./HeaderText";

// ── Header components ──────────────────────────────────────────────

interface GameWindowTitleHeaderProps {
	readonly title: string;
	readonly onClose?: () => void;
}

export function GameWindowTitleHeader({ title, onClose }: GameWindowTitleHeaderProps) {
	const rem = useRem();

	return (
		<HStack spacing={rem(1)} size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y}>
			{/* Left spacer — same width as close button so the title stays centered */}
			<frame Size={new UDim2(0, rem(4.5), 0, rem(4.5))} BackgroundTransparency={1} />

			<Frame size={new UDim2(0, 0, 0, 0)} backgroundTransparency={1} automaticSize={Enum.AutomaticSize.XY}>
				<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
				<HeaderText text={title} separator=" " />
			</Frame>

			<MainButton fitContent onClick={onClose}>
				<ShopButtonIcon icon={assets.ui.shop.Close} />
			</MainButton>
		</HStack>
	);
}

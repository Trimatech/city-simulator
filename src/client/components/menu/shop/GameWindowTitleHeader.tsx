import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { MainButton, ShopButtonIcon } from "../../../ui/MainButton";

const TEXT_BG_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#FFEC7D")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#F5B32B")),
]);

const TEXT_STROKE_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, palette.subtitleStrokeFrom),
	new ColorSequenceKeypoint(1, palette.subtitleStrokeTo),
]);

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
				<Text
					font={fonts.fredokaOne.regular}
					text={title}
					textColor={palette.yellow}
					textSize={rem(4.5)}
					size={new UDim2(1, 0, 0, 0)}
					automaticSize={Enum.AutomaticSize.Y}
					textXAlignment="Center"
					textYAlignment="Center"
				>
					<uigradient Color={TEXT_BG_GRADIENT} Rotation={90} />
					<uistroke Thickness={rem(0.25)} Color={palette.white}>
						<uigradient Color={TEXT_STROKE_GRADIENT} Rotation={90} />
					</uistroke>
				</Text>
			</Frame>

			<MainButton fitContent onClick={onClose}>
				<ShopButtonIcon icon={assets.ui.shop.Close} />
			</MainButton>
		</HStack>
	);
}

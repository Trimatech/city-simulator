import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

interface QuestProgressBarProps {
	readonly progress: number;
	readonly accent: Color3;
	readonly accentDark: Color3;
	readonly label: string;
	readonly emoji: string;
	readonly valueText: string;
}

export function QuestProgressBar({ progress, accent, accentDark, label, emoji, valueText }: QuestProgressBarProps) {
	const rem = useRem();
	const clamped = math.clamp(progress, 0, 1);
	const done = clamped >= 1;

	return (
		<Frame size={new UDim2(1, 0, 0, rem(4.3))} backgroundColor={accentDark} backgroundTransparency={0.15}>
			<uicorner CornerRadius={new UDim(0, rem(1.2))} />
			<uistroke Color={accent} Thickness={rem(0.1)} Transparency={done ? 0 : 0.5} />

			<Image
				image={assets.ui.patterns.dots_pattern}
				imageColor3={palette.white}
				imageTransparency={0.94}
				scaleType="Tile"
				tileSize={new UDim2(0, rem(3), 0, rem(3))}
				size={new UDim2(1, 0, 1, 0)}
			>
				<uicorner CornerRadius={new UDim(0, rem(1.2))} />
			</Image>

			<Frame size={new UDim2(clamped, 0, 1, 0)} backgroundColor={accent} backgroundTransparency={0.4}>
				<uicorner CornerRadius={new UDim(0, rem(1.2))} />
			</Frame>

			<HStack
				size={new UDim2(1, 0, 1, 0)}
				spacing={rem(0.7)}
				padding={rem(0.6)}
				verticalAlignment={Enum.VerticalAlignment.Center}
			>
				<Text
					font={fonts.fredokaOne.regular}
					text={emoji}
					textSize={rem(1.9)}
					size={new UDim2(0, rem(3), 1, 0)}
					backgroundTransparency={1}
				/>
				<Text
					font={fonts.fredokaOne.regular}
					text={label}
					textColor={palette.white}
					textSize={rem(1.05)}
					textXAlignment="Left"
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={1}
				>
					<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
					<uistroke Thickness={rem(0.08)} Color={Color3.fromHex("#000")} Transparency={0.5} />
				</Text>
				<Text
					font={fonts.inter.bold}
					text={valueText}
					textColor={done ? palette.claimYellow : palette.white}
					textSize={rem(0.95)}
					textXAlignment="Right"
					size={new UDim2(0, rem(7.6), 1, 0)}
					backgroundTransparency={1}
				/>
			</HStack>
		</Frame>
	);
}

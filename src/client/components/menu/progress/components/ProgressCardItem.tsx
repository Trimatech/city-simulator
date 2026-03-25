import React, { useMemo } from "@rbxts/react";
import { HStack, VStack } from "@rbxts-ui/layout";
import { Image, Text } from "@rbxts-ui/primitives";
import { ProgressBar } from "client/components/ProgressBar";
import { StylizedBox } from "client/components/StylizedBox";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { brighten, darken } from "shared/utils/color-utils";

import { ShopItemTheme, shopItemThemes } from "../../shop/ShopItem";

function themeFromAccent(accent: Color3): ShopItemTheme {
	return {
		outerBorderColor: darken(accent, 0.85),
		whiteBorderColor: brighten(accent, 0.85, 0.6),
		innerBorderFrom: brighten(accent, 0.15),
		innerBorderTo: darken(accent, 0.15),
		gradientFrom: brighten(accent, 0.25),
		gradientTo: darken(accent, 0.25),
		raysTransparency: 1,
		rayTint: accent,
		titleStrokeFrom: darken(accent, 0.6),
		titleStrokeTo: darken(accent, 0.8),
		subtitleStrokeFrom: darken(accent, 0.6),
		subtitleStrokeTo: darken(accent, 0.8),
		labelStrokeFrom: darken(accent, 0.6),
		labelStrokeTo: darken(accent, 0.8),
	};
}

interface ProgressCardItemProps {
	readonly title: string;
	readonly subtitle?: string;
	readonly valueText: string;
	readonly icon?: string;
	readonly accent?: Color3;
	readonly progress: number;
	readonly progressLabel: string;
	readonly layoutOrder?: number;
}

export function ProgressCardItem({
	title,
	subtitle,
	valueText,
	icon,
	accent,
	progress,
	progressLabel,
	layoutOrder,
}: ProgressCardItemProps) {
	const rem = useRem();
	const clamped = math.clamp(progress, 0, 1);
	const theme = useMemo(() => (accent ? themeFromAccent(accent) : shopItemThemes.blue), [accent]);
	const strokeColor = accent ? darken(accent, 0.6) : Color3.fromHex("#005794");

	return (
		<StylizedBox
			theme={theme}
			size={new UDim2(1, 0, 0, 0)}
			automaticSize={Enum.AutomaticSize.Y}
			layoutOrder={layoutOrder}
		>
			<VStack
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				spacing={rem(1.4)}
				padding={rem(1.4)}
			>
				<HStack
					size={new UDim2(1, 0, 0, rem(5.5))}
					spacing={rem(1.2)}
					verticalAlignment={Enum.VerticalAlignment.Center}
				>
					{icon !== undefined && (
						<Image image={icon} size={new UDim2(0, rem(5), 0, rem(5))} scaleType="Fit" />
					)}
					<VStack
						size={new UDim2(1, 0, 1, 0)}
						spacing={rem(0.2)}
						verticalAlignment={Enum.VerticalAlignment.Center}
						horizontalAlignment={Enum.HorizontalAlignment.Left}
					>
						<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
						<Text
							font={fonts.fredokaOne.regular}
							text={title}
							textColor={palette.white}
							textSize={rem(2.3)}
							textXAlignment="Left"
							size={new UDim2(1, 0, 0, rem(2.5))}
							backgroundTransparency={1}
						>
							<uistroke Thickness={rem(0.12)} Color={strokeColor} Transparency={0.3} />
						</Text>
						{subtitle !== undefined && (
							<Text
								font={fonts.fredokaOne.regular}
								text={subtitle}
								textColor={brighten(accent ?? Color3.fromHex("#5bc6ff"), 0.5)}
								textSize={rem(1.1)}
								textXAlignment="Left"
								textWrapped={true}
								size={new UDim2(1, 0, 0, rem(1.3))}
								backgroundTransparency={1}
							>
								<uistroke Thickness={rem(0.08)} Color={strokeColor} Transparency={0.5} />
							</Text>
						)}
					</VStack>
					<Text
						font={fonts.fredokaOne.regular}
						text={valueText}
						textColor={palette.white}
						textSize={rem(2.3)}
						textXAlignment="Right"
						size={new UDim2(0, 0, 1, 0)}
						textAutoResize="X"
						backgroundTransparency={1}
					>
						<uistroke Thickness={rem(0.12)} Color={strokeColor} Transparency={0.3} />
					</Text>
				</HStack>

				<frame Size={new UDim2(1, 0, 0, 0)} AutomaticSize={Enum.AutomaticSize.Y} BackgroundTransparency={1}>
					<ProgressBar progress={clamped} accent={accent} />
					<Text
						font={fonts.fredokaOne.regular}
						text={progressLabel}
						textColor={palette.white}
						textSize={rem(0.85)}
						size={new UDim2(1, 0, 1, 0)}
						textXAlignment="Center"
						textYAlignment="Center"
						zIndex={5}
						backgroundTransparency={1}
					>
						<uistroke Thickness={rem(0.06)} Color={Color3.fromHex("#0e2a4e")} />
					</Text>
				</frame>
			</VStack>
		</StylizedBox>
	);
}

import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { heading1Gradient, palette, textStrokeGradient } from "shared/constants/palette";

interface SectionHeaderProps {
	readonly text: string;
}

export function SectionHeader({ text }: SectionHeaderProps) {
	const rem = useRem();

	return (
		<HStack spacing={rem(2)} size={new UDim2(1, 0, 0, rem(2.4))} padding={rem(2.2)}>
			<Text
				font={fonts.fredokaOne.regular}
				text={text}
				textColor={palette.claimYellow}
				textSize={rem(2)}
				automaticSize={Enum.AutomaticSize.X}
				size={new UDim2(0, 0, 1, 0)}
				backgroundTransparency={1}
			>
				<uistroke Thickness={rem(0.2)} Color={palette.white}>
					<uigradient Color={textStrokeGradient} Rotation={90} />
				</uistroke>
				<uigradient Color={heading1Gradient} Rotation={90} />
			</Text>
			<Frame
				size={new UDim2(1, 0, 0, rem(0.2))}
				backgroundColor={Color3.fromHex("#FFCF26")}
				backgroundTransparency={0}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
				<uistroke Thickness={rem(0.2)} Color={palette.white}>
					<uigradient Color={textStrokeGradient} Rotation={90} />
				</uistroke>
				<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
			</Frame>
		</HStack>
	);
}

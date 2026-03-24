import React from "@rbxts/react";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

interface SectionHeaderProps {
	readonly text: string;
}

export function SectionHeader({ text }: SectionHeaderProps) {
	const rem = useRem();

	return (
		<Frame size={new UDim2(1, 0, 0, rem(3.2))} backgroundTransparency={1}>
			<Text
				font={fonts.fredokaOne.regular}
				text={text}
				textColor={palette.white}
				textSize={rem(1.62)}
				textXAlignment="Left"
				textYAlignment="Bottom"
				size={new UDim2(1, 0, 1, rem(-0.2))}
				backgroundTransparency={1}
			>
				<uistroke Thickness={rem(0.12)} Color={palette.white}>
					<uigradient
						Color={new ColorSequence(palette.claimYellow, Color3.fromHex("#c49000"))}
						Rotation={90}
					/>
				</uistroke>
			</Text>
			<Frame
				size={new UDim2(1, 0, 0, rem(0.15))}
				position={new UDim2(0, 0, 1, rem(-0.3))}
				backgroundColor={palette.claimYellow}
				backgroundTransparency={0.5}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</Frame>
		</Frame>
	);
}

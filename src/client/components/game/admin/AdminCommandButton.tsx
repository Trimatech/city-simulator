import React from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

interface AdminCommandButtonProps {
	readonly text: string;
	readonly color: Color3;
	readonly size: UDim2;
	readonly onClick: () => void;
	readonly layoutOrder?: number;
}

export function AdminCommandButton({ text, color, size, onClick, layoutOrder }: AdminCommandButtonProps) {
	const rem = useRem();
	const pillRadius = new UDim(0, rem(0.8));

	return (
		<ReactiveButton2
			onClick={onClick}
			backgroundTransparency={1}
			size={size}
			layoutOrder={layoutOrder}
		>
			<Frame
				backgroundColor={color}
				cornerRadius={pillRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uistroke
					Color={Color3.fromRGB(
						math.clamp(color.R * 255 - 40, 0, 255) / 255,
						math.clamp(color.G * 255 - 40, 0, 255) / 255,
						math.clamp(color.B * 255 - 40, 0, 255) / 255,
					)}
					Thickness={rem(0.12)}
				/>
				<Text
					text={text}
					font={fonts.fredokaOne.regular}
					textColor={palette.white}
					textSize={rem(1.6)}
					size={new UDim2(1, 0, 1, 0)}
					textXAlignment="Center"
					textYAlignment="Center"
				>
					<uistroke Thickness={rem(0.08)} Color={Color3.fromRGB(0, 0, 0)} />
				</Text>
			</Frame>
		</ReactiveButton2>
	);
}

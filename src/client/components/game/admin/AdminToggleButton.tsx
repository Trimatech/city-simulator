import React from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

interface AdminToggleButtonProps {
	readonly onClick: () => void;
}

export function AdminToggleButton({ onClick }: AdminToggleButtonProps) {
	const rem = useRem();

	return (
		<ReactiveButton2
			onClick={onClick}
			backgroundTransparency={1}
			size={new UDim2(0, rem(5), 0, rem(5))}
			position={new UDim2(1, -rem(1), 1, -rem(1))}
			anchorPoint={new Vector2(1, 1)}
			zIndex={50}
		>
			<Frame
				backgroundColor={Color3.fromRGB(200, 50, 50)}
				cornerRadius={new UDim(1, 0)}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0.15}
			>
				<uistroke Color={palette.white} Thickness={rem(0.15)} Transparency={0.5} />
				<Text
					text="ADM"
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

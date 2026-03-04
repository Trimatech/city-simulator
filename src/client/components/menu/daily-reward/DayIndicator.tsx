import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { VStack } from "client/ui/layout/VStack";
import { Text } from "client/ui/text";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

interface DayIndicatorProps {
	readonly day: number;
	readonly isCurrentDay: boolean;
	readonly isPastDay: boolean;
	readonly reward: number;
}

export function DayIndicator({ day, isCurrentDay, isPastDay, reward }: DayIndicatorProps) {
	const rem = useRem();
	const isFutureDay = !isCurrentDay && !isPastDay;

	return (
		<Frame
			size={new UDim2(0, rem(5), 0, rem(5))}
			backgroundColor={palette.green}
			backgroundTransparency={0}
			cornerRadius={new UDim(0, rem(1))}
		>
			<Image
				image={assets.ui.sunburst}
				size={new UDim2(1, 0, 1, 0)}
				imageColor={palette.white}
				imageTransparency={0.55}
				scaleType="Crop"
			/>
			<VStack
				size={new UDim2(1, 0, 1, 0)}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
				verticalAlignment={Enum.VerticalAlignment.Center}
				spacing={rem(0.2)}
			>
				<Text
					font={fonts.inter.bold}
					text={`Day ${day}`}
					textColor={palette.base}
					textSize={rem(1)}
					automaticSize={Enum.AutomaticSize.XY}
				>
					<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.2)} />
				</Text>
				<HStack horizontalAlignment={Enum.HorizontalAlignment.Center} automaticSize={Enum.AutomaticSize.XY}>
					<Text
						font={fonts.inter.bold}
						text={`${reward}`}
						textColor={palette.base}
						textSize={rem(1.2)}
						automaticSize={Enum.AutomaticSize.XY}
					/>
					<Image
						image={assets.ui.shards_icon}
						size={new UDim2(0, rem(1), 0, rem(1.2))}
						imageColor={palette.base}
						scaleType="Crop"
					/>
				</HStack>
			</VStack>
			<uistroke Color={palette.white} Transparency={0} Thickness={rem(isCurrentDay ? 0.3 : 0.15)} />
			{(isPastDay || isFutureDay) && (
				<Text
					text={isPastDay ? "✅" : "🔒"}
					textSize={rem(1.2)}
					position={new UDim2(1, rem(-1.6), 1, rem(-1.6))}
					size={new UDim2(0, rem(1.4), 0, rem(1.4))}
				/>
			)}
		</Frame>
	);
}

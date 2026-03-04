import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { CanvasGroup } from "client/ui/canvas-group";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
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
		<Frame size={new UDim2(0, rem(5), 0, rem(5))} cornerRadius={new UDim(0, rem(1))}>
			<CanvasGroup
				backgroundColor={palette.green}
				backgroundTransparency={0}
				size={new UDim2(1, 0, 1, 0)}
				cornerRadius={new UDim(0, rem(1))}
			>
				<Image
					image={assets.ui.sunburst}
					size={new UDim2(1, 0, 1, 0)}
					imageColor={palette.white}
					imageTransparency={0.55}
					scaleType="Crop"
				/>
			</CanvasGroup>
			<Text
				font={fonts.mplus.bold}
				text={`Day ${day}`}
				textColor={palette.base}
				textSize={rem(2)}
				automaticSize={Enum.AutomaticSize.XY}
				position={new UDim2(0.5, 0, 0, 0)}
				anchorPoint={new Vector2(0.5, 0.5)}
			>
				<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.3)} />
			</Text>

			<HStack
				horizontalAlignment={Enum.HorizontalAlignment.Center}
				automaticSize={Enum.AutomaticSize.XY}
				verticalAlignment={Enum.VerticalAlignment.Center}
			>
				<Text
					font={fonts.mplus.bold}
					text={`${reward}`}
					textColor={palette.base}
					textSize={rem(3)}
					automaticSize={Enum.AutomaticSize.XY}
					textXAlignment="Center"
					textYAlignment="Center"
				/>
				<Image image={assets.ui.shards_icon_color} size={new UDim2(0, rem(1.5), 0, rem(3))} scaleType="Crop" />
			</HStack>

			<uistroke Color={palette.white} Transparency={0} Thickness={rem(isCurrentDay ? 0.3 : 0.15)} />
			{(isPastDay || isFutureDay) && (
				<Text
					text={isPastDay ? "✅" : "🔒"}
					textSize={rem(1.2)}
					position={new UDim2(1, rem(-1.5), 1, rem(-1.5))}
					size={new UDim2(0, rem(1.4), 0, rem(1.4))}
				/>
			)}
		</Frame>
	);
}

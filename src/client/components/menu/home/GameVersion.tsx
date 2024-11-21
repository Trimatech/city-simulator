import React from "@rbxts/react";
import { Text } from "client/components/ui/text";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { IS_PROD } from "shared/constants/core";
import { palette } from "shared/constants/palette";

const MODE = IS_PROD ? "production" : "development";
export function GameVersion() {
	const rem = useRem();
	const size = new UDim2(0, rem(20), 0, rem(1.25));

	const position = new UDim2(1, -rem(0.5), 1, -rem(0.5));
	const anchorPoint = new Vector2(1, 1);

	return (
		<Text
			richText
			font={fonts.inter.medium}
			text={`${MODE}`}
			textSize={rem(1.25)}
			size={size}
			textColor={palette.text}
			textTransparency={0.5}
			textXAlignment="Right"
			textYAlignment="Bottom"
			position={position}
			anchorPoint={anchorPoint}
		/>
	);
}

import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { Text } from "@rbxts-ui/primitives";
import { $env } from "rbxts-transform-env";
import { palette } from "shared/constants/palette";

const DIVIDER = `  <font transparency="0.75">—</font>  `;
const VERSION = $env.string("npm_package_version", "unknown")!;
const BUILD_ISO_DATE = $env.string("BUILD_ISO_DATE");

export function GameVersion() {
	const rem = useRem();
	const size = new UDim2(0, rem(20), 0, rem(1.25));

	const position = new UDim2(1, -rem(0.5), 1, -rem(0.5));
	const anchorPoint = new Vector2(1, 1);

	return (
		<Text
			richText
			font={fonts.inter.medium}
			text={`v${VERSION} ${DIVIDER} ${BUILD_ISO_DATE}`}
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

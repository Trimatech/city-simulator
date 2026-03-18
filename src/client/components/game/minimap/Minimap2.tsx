import React from "@rbxts/react";
import { Frame, Group, Image } from "@rbxts-ui/primitives";
import { RemProvider } from "client/ui/rem/RemProvider";
import assets from "shared/assets";
import { BORDER_GRADIENT, palette } from "shared/constants/palette";

import { MinimapNodes } from "./MinimapNodes";
import { MINIMUM_MINIMAP_REM, useMinimapRem } from "./utils";

const DARK_BORDER_THICKNESS = 0.2;
const BORDER_THICKNESS = 0.05;

export function Minimap() {
	const rem = useMinimapRem();

	const { anchorPoint, position } = { anchorPoint: new Vector2(1, 1), position: new UDim2(1, 0, 1, 0) };

	const cornerRadius = new UDim(1, 0);

	return (
		<RemProvider minimumRem={MINIMUM_MINIMAP_REM}>
			<Group
				anchorPoint={anchorPoint}
				size={new UDim2(0, rem(10), 0, rem(10))}
				position={position}
				name="Minimap"
			>
				<Image
					image={assets.ui.world_bg}
					cornerRadius={cornerRadius}
					size={new UDim2(1, 0, 1, 0)}
					scaleType="Fit"
					rotation={180}
				/>

				<Frame
					backgroundTransparency={1}
					cornerRadius={cornerRadius}
					size={new UDim2(1, -2, 1, -2)}
					position={new UDim2(0, 1, 0, 1)}
				>
					<uistroke Color={palette.darkBorderColor} Thickness={rem(DARK_BORDER_THICKNESS)} ZIndex={1} />
					<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
						<uigradient Color={BORDER_GRADIENT} Rotation={90} />
					</uistroke>
				</Frame>

				<MinimapNodes />
			</Group>
		</RemProvider>
	);
}

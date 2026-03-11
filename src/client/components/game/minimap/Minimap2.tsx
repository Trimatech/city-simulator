import React from "@rbxts/react";
import { useInputDevice } from "client/hooks";
import { RemProvider } from "@rbxts-ui/rem";
import { Image } from "@rbxts-ui/primitives";
import { Frame } from "@rbxts-ui/primitives";
import { Group } from "@rbxts-ui/primitives";
import { Outline } from "@rbxts-ui/components";
import { Shadow } from "client/ui/shadow";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { MinimapNodes } from "./MinimapNodes";
import { MINIMUM_MINIMAP_REM, useMinimapRem } from "./utils";

export function Minimap() {
	const rem = useMinimapRem();
	const touch = useInputDevice() === "touch";

	const { anchorPoint, position } = touch
		? { anchorPoint: new Vector2(1, 0.5), position: new UDim2(1, -rem(3.5), 0.5, 0) }
		: { anchorPoint: new Vector2(1, 1), position: new UDim2(1, -rem(4), 1, -rem(4)) };

	const cornerRadius = new UDim(1, 0);

	return (
		<RemProvider minimumRem={MINIMUM_MINIMAP_REM}>
			<Group
				anchorPoint={anchorPoint}
				size={new UDim2(0, rem(10), 0, rem(10))}
				position={position}
				name="Minimap"
			>
				<Shadow
					shadowColor={palette.black}
					shadowSize={rem(5)}
					shadowPosition={rem(1.5)}
					shadowTransparency={0}
				/>

				<Frame
					backgroundColor={palette.white}
					cornerRadius={cornerRadius}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
				>
					<uigradient
						Color={new ColorSequence(palette.crust, palette.mantle)}
						Transparency={new NumberSequence(0.3, 0.1)}
						Rotation={-45}
					/>
					<uistroke Color={palette.lavender} Transparency={0.9} Thickness={rem(0.25)} />
				</Frame>

				<Frame
					backgroundTransparency={1}
					cornerRadius={cornerRadius}
					size={new UDim2(1, -2, 1, -2)}
					position={new UDim2(0, 1, 0, 1)}
				>
					<uistroke Color={palette.text} Transparency={0.85} Thickness={rem(0.05)} />
				</Frame>

				<Image
					image={assets.ui.map_crosshair}
					anchorPoint={new Vector2(0.5, 0.5)}
					size={new UDim2(0, rem(1), 0, rem(1))}
					position={new UDim2(0.5, 0, 0.5, 0)}
				/>

				<MinimapNodes />
				<Outline cornerRadius={cornerRadius} innerTransparency={0} outerTransparency={1} />
			</Group>
		</RemProvider>
	);
}

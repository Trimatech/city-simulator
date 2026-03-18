import React from "@rbxts/react";
import { VStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const WINDOW_BG = Color3.fromHex("#3a90dd");
const WINDOW_OUTER_BORDER = Color3.fromHex("#000000");

const DARK_BORDER_THICKNESS = 0.2;
const DARK_BORDER_COLOR = Color3.fromHex("#01253B");
const DARK_BG = Color3.fromHex("#00334e");

const BORDER_THICKNESS = 0.3;
const BORDER_GRADIENT = new ColorSequence([
	new ColorSequenceKeypoint(0, Color3.fromHex("#C1E3FF")),
	new ColorSequenceKeypoint(0.5, Color3.fromHex("#43B9F7")),
	new ColorSequenceKeypoint(1, Color3.fromHex("#326FB6")),
]);

interface GameWindowProps {
	readonly header: React.Element;
	readonly children: React.Element;
}

export function GameWindow({ header, children }: GameWindowProps) {
	const rem = useRem();

	const windowRadius = new UDim(0, rem(2.8));
	const contentRadius = new UDim(0, rem(1.5));

	return (
		<Frame
			size={new UDim2(0.9, 0, 0, 0)}
			name="GameWindow"
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			backgroundColor={WINDOW_OUTER_BORDER}
			backgroundTransparency={0}
			cornerRadius={windowRadius}
			automaticSize={Enum.AutomaticSize.Y}
		>
			<uisizeconstraint MaxSize={new Vector2(rem(70), rem(50))} />
			<Frame
				backgroundColor={WINDOW_BG}
				backgroundTransparency={0}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
			>
				<uicorner CornerRadius={windowRadius} />
				<uistroke
					Color={DARK_BORDER_COLOR}
					Thickness={rem(DARK_BORDER_THICKNESS + BORDER_THICKNESS)}
					ZIndex={1}
				/>
				<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
					<uigradient Color={BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				<imagelabel
					Image={assets.ui.clouds_bg}
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					ScaleType={Enum.ScaleType.Crop}
					ImageTransparency={0}
				>
					<uicorner CornerRadius={windowRadius} />
				</imagelabel>

				<VStack
					spacing={rem(1)}
					padding={rem(1.9)}
					size={new UDim2(1, 0, 0, 0)}
					automaticSize={Enum.AutomaticSize.Y}
				>
					{header}

					{/* Content area */}
					<Frame
						backgroundColor={DARK_BG}
						backgroundTransparency={0}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
					>
						{/* <uiflexitem FlexMode={Enum.UIFlexMode.Fill} /> */}
						<uicorner CornerRadius={contentRadius} />
						<uistroke Color={DARK_BORDER_COLOR} Thickness={rem(DARK_BORDER_THICKNESS)} ZIndex={2} />
						<uistroke
							Color={palette.white}
							Thickness={rem(BORDER_THICKNESS + DARK_BORDER_THICKNESS)}
							ZIndex={1}
						>
							<uigradient Color={BORDER_GRADIENT} Rotation={-90} />
						</uistroke>

						<imagelabel
							Image={assets.ui.shop.shop_room_bg}
							BackgroundTransparency={1}
							Size={new UDim2(1, 0, 1, 0)}
							ScaleType={Enum.ScaleType.Tile}
							TileSize={new UDim2(0, 256, 0, 256)}
							ImageTransparency={0}
						>
							<uicorner CornerRadius={contentRadius} />
						</imagelabel>

						{children}
					</Frame>
				</VStack>
			</Frame>
		</Frame>
	);
}

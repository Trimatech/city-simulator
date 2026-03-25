import React from "@rbxts/react";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { ShopItemTheme, shopItemThemes } from "./menu/shop/ShopItem";

interface StylizedBoxProps {
	readonly theme?: ShopItemTheme;
	readonly size?: UDim2;
	readonly automaticSize?: Enum.AutomaticSize;
	readonly layoutOrder?: number;
	readonly children?: React.ReactNode;
	readonly name?: string;
}

export function StylizedBox({
	theme = shopItemThemes.blue,
	size = new UDim2(1, 0, 0, 0),
	automaticSize,
	layoutOrder,
	children,
	name = "StylizedBox",
}: StylizedBoxProps) {
	const rem = useRem();

	const outerRadius = new UDim(0, rem(1.8));
	const whiteRadius = new UDim(0, rem(1.5));
	const innerRadius = new UDim(0, rem(1.2));
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const innerBorderGradient = new ColorSequence(theme.innerBorderFrom, theme.innerBorderTo);
	const borderPad = new UDim(0, rem(0.3));
	const whitePad = new UDim(0, rem(0.3));

	return (
		<Frame
			size={size}
			automaticSize={automaticSize}
			layoutOrder={layoutOrder}
			backgroundTransparency={1}
			name={name}
		>
			{/* Layer 1: Outer border */}
			<Frame
				backgroundColor={theme.outerBorderColor}
				cornerRadius={outerRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
				automaticSize={automaticSize}
			>
				<uipadding
					PaddingTop={borderPad}
					PaddingBottom={borderPad}
					PaddingLeft={borderPad}
					PaddingRight={borderPad}
				/>

				{/* Layer 2: White/cream band */}
				<Frame
					backgroundColor={theme.whiteBorderColor}
					cornerRadius={whiteRadius}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
					automaticSize={automaticSize}
				>
					<uipadding
						PaddingTop={whitePad}
						PaddingBottom={whitePad}
						PaddingLeft={whitePad}
						PaddingRight={whitePad}
					/>

					{/* Layer 3: Inner gradient area */}
					<Frame
						backgroundColor={palette.white}
						cornerRadius={innerRadius}
						size={new UDim2(1, 0, 1, 0)}
						backgroundTransparency={0}
						name="StylizedBoxInner"
						clipsDescendants={true}
						automaticSize={automaticSize}
					>
						<uistroke Color={palette.white} Thickness={rem(0.15)}>
							<uigradient Color={innerBorderGradient} Rotation={90} />
						</uistroke>
						<uigradient Color={gradientSequence} Rotation={90} />

						<imagelabel
							Image={assets.ui.patterns.dots_pattern}
							ImageColor3={palette.white}
							ImageTransparency={0.96}
							ScaleType={Enum.ScaleType.Tile}
							TileSize={new UDim2(0, rem(4), 0, rem(4))}
							Size={new UDim2(1, 0, 0, 0)}
							AutomaticSize={automaticSize}
							BackgroundTransparency={1}
						>
							<uicorner CornerRadius={outerRadius} />
							{children}
						</imagelabel>
					</Frame>
				</Frame>
			</Frame>
		</Frame>
	);
}

import React from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { Frame, Image } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { ShopItemButtonTheme, shopItemButtonThemes } from "./ShopItemButton";

interface ShopIconButtonProps {
	readonly icon: string;
	readonly onClick?: () => void;
	readonly theme?: ShopItemButtonTheme;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly layoutOrder?: number;
}

export function ShopIconButton({
	icon,
	onClick,
	theme = shopItemButtonThemes.blue,
	size,
	position,
	anchorPoint,
	layoutOrder,
}: ShopIconButtonProps) {
	const rem = useRem();

	const buttonHeight = rem(4);
	const buttonSize = size ?? new UDim2(0, buttonHeight, 0, buttonHeight);
	const pillRadius = new UDim(1, 0);
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const outerPadding = new UDim(0, rem(0.2));

	return (
		<ReactiveButton2
			onClick={onClick}
			backgroundTransparency={1}
			size={buttonSize}
			position={position}
			anchorPoint={anchorPoint}
			layoutOrder={layoutOrder}
			zIndex={100}
		>
			{/* Outer background with dark border */}
			<Frame
				name="ShopIconButton"
				backgroundColor={theme.backgroundColor}
				cornerRadius={pillRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uistroke Color={theme.outerBorderColor} Thickness={rem(0.2)} />
				<uipadding
					PaddingTop={outerPadding}
					PaddingBottom={outerPadding}
					PaddingLeft={outerPadding}
					PaddingRight={outerPadding}
				/>

				{/* Inner frame with gradient and light border */}
				<Frame
					backgroundColor={palette.white}
					cornerRadius={pillRadius}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={0}
					clipsDescendants={true}
				>
					<uistroke Color={theme.innerBorderColor} Thickness={rem(0.15)} />
					<uigradient Color={gradientSequence} Rotation={90} />

					{/* Noise texture overlay */}
					<Image
						image={assets.ui.shop_button_noise}
						size={new UDim2(1, 0, 1, 0)}
						imageTransparency={0}
						scaleType="Tile"
						tileSize={new UDim2(0, rem(40), 0, rem(40))}
					>
						<uicorner CornerRadius={pillRadius} />
					</Image>

					{/* Icon centered */}
					<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1} ZIndex={2}>
						<uilistlayout
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>
						<Image image={icon} size={new UDim2(0, rem(3), 0, rem(3))} scaleType="Fit" />
					</frame>
				</Frame>
			</Frame>
		</ReactiveButton2>
	);
}

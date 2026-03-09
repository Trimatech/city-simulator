import React from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { Image } from "client/ui/image";
import { Frame } from "client/ui/layout/frame";
import { ReactiveButton } from "client/ui/reactive-button";
import { Text } from "client/ui/text";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

export interface ShopItemButtonTheme {
	readonly backgroundColor: Color3;
	readonly outerBorderColor: Color3;
	readonly innerBorderColor: Color3;
	readonly gradientFrom: Color3;
	readonly gradientTo: Color3;
	readonly textStrokeFrom: Color3;
	readonly textStrokeTo: Color3;
}

export const shopItemButtonThemes = {
	blue: {
		backgroundColor: Color3.fromRGB(11, 150, 218),
		outerBorderColor: Color3.fromRGB(14, 42, 78),
		innerBorderColor: Color3.fromRGB(120, 211, 255),
		gradientFrom: Color3.fromRGB(118, 210, 255),
		gradientTo: Color3.fromRGB(48, 187, 255),
		textStrokeFrom: Color3.fromRGB(10, 60, 130),
		textStrokeTo: Color3.fromRGB(5, 40, 100),
	},
} as const;

interface ShopItemButtonProps {
	readonly text: string;
	readonly onClick?: () => void;
	readonly theme?: ShopItemButtonTheme;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly layoutOrder?: number;
}

export function ShopItemButton({
	text,
	onClick,
	theme = shopItemButtonThemes.blue,
	size,
	position,
	anchorPoint,
	layoutOrder,
}: ShopItemButtonProps) {
	const rem = useRem();

	const buttonSize = size ?? new UDim2(0, rem(13), 0, rem(4));
	const pillRadius = new UDim(1, 0);
	const gradientSequence = new ColorSequence(theme.gradientFrom, theme.gradientTo);
	const textStrokeGradient = new ColorSequence(theme.textStrokeFrom, theme.textStrokeTo);

	return (
		<ReactiveButton
			onClick={onClick}
			backgroundTransparency={1}
			size={buttonSize}
			position={position}
			anchorPoint={anchorPoint}
			layoutOrder={layoutOrder}
		>
			{/* Outer background with dark border */}
			<Frame
				backgroundColor={theme.backgroundColor}
				cornerRadius={pillRadius}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uistroke Color={theme.outerBorderColor} Thickness={rem(0.2)} />
				<uipadding
					PaddingTop={new UDim(0, rem(0.2))}
					PaddingBottom={new UDim(0, rem(0.35))}
					PaddingLeft={new UDim(0, rem(0.2))}
					PaddingRight={new UDim(0, rem(0.2))}
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
						imageTransparency={0.6}
						scaleType="Tile"
						tileSize={new UDim2(0, rem(16), 0, rem(16))}
					/>

					<Text
						text={text}
						font={fonts.fredokaOne.regular}
						textColor={palette.white}
						textSize={rem(2.2)}
						size={new UDim2(1, 0, 1, 0)}
						textXAlignment="Center"
						textYAlignment="Center"
					>
						<uistroke Thickness={rem(0.15)} Color={palette.white}>
							<uigradient Color={textStrokeGradient} Rotation={90} />
						</uistroke>
					</Text>
				</Frame>
			</Frame>
		</ReactiveButton>
	);
}

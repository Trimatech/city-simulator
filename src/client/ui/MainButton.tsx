import React from "@rbxts/react";
import { ReactiveButton2 } from "@rbxts-ui/components";
import { Frame, Image, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
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
	readonly textColor: Color3;
}

const blueButtonTheme: ShopItemButtonTheme = {
	backgroundColor: Color3.fromRGB(11, 150, 218),
	outerBorderColor: Color3.fromRGB(14, 42, 78),
	innerBorderColor: Color3.fromRGB(120, 211, 255),
	gradientFrom: Color3.fromRGB(118, 210, 255),
	gradientTo: Color3.fromRGB(48, 187, 255),
	textStrokeFrom: Color3.fromRGB(10, 60, 130),
	textStrokeTo: Color3.fromRGB(5, 40, 100),
	textColor: palette.white,
};

export const shopItemButtonThemes = {
	blue: blueButtonTheme,
	cyan: {
		backgroundColor: Color3.fromRGB(11, 184, 218),
		outerBorderColor: Color3.fromRGB(14, 42, 78),
		innerBorderColor: Color3.fromRGB(109, 233, 255),
		gradientFrom: Color3.fromRGB(133, 243, 255),
		gradientTo: Color3.fromRGB(46, 219, 238),
		textStrokeFrom: Color3.fromRGB(10, 80, 120),
		textStrokeTo: Color3.fromRGB(5, 60, 100),
		textColor: palette.white,
	},
	claimYellow: {
		...blueButtonTheme,
		textColor: palette.claimYellow,
	},
} as const;

const CONTENT_PADDING = new UDim(0, 20);
const CONTENT_PADDING_LEFT_WITH_ICON = new UDim(0, 6);

interface ShopItemButtonProps extends React.PropsWithChildren {
	/** When true, the button width shrinks to fit its content. */
	readonly fitContent?: boolean;
	readonly onClick?: () => void;
	readonly onHover?: (hovered: boolean) => void;
	readonly enabled?: boolean;
	readonly theme?: ShopItemButtonTheme;
	readonly isActive?: boolean;
	readonly size?: UDim2;
	readonly position?: UDim2;
	readonly anchorPoint?: Vector2;
	readonly layoutOrder?: number;
}

export function MainButton({
	children,
	fitContent = false,
	onClick,
	onHover,
	enabled,
	theme = shopItemButtonThemes.blue,
	isActive,
	size,
	position,
	anchorPoint,
	layoutOrder,
}: ShopItemButtonProps) {
	const rem = useRem();

	const activeTheme = isActive === true ? shopItemButtonThemes.cyan : theme;

	const buttonSize = fitContent ? new UDim2(0, 0, 0, rem(4)) : (size ?? new UDim2(0, rem(13), 0, rem(4)));
	const autoSize = fitContent ? Enum.AutomaticSize.X : undefined;
	const frameSize = fitContent ? new UDim2(0, 0, 1, 0) : new UDim2(1, 0, 1, 0);
	const pillRadius = new UDim(1, 0);
	const gradientSequence = new ColorSequence(activeTheme.gradientFrom, activeTheme.gradientTo);

	return (
		<ReactiveButton2
			onClick={onClick}
			onHover={onHover}
			enabled={enabled}
			backgroundTransparency={1}
			size={buttonSize}
			automaticSize={autoSize}
			position={position}
			anchorPoint={anchorPoint}
			layoutOrder={layoutOrder}
			zIndex={100}
		>
			{/* Outer background with dark border */}
			<Frame
				name="ShopItemButton"
				backgroundColor={activeTheme.backgroundColor}
				cornerRadius={pillRadius}
				size={frameSize}
				automaticSize={autoSize}
				backgroundTransparency={0}
			>
				<uistroke Color={activeTheme.outerBorderColor} Thickness={rem(0.2)} />
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
					size={frameSize}
					automaticSize={autoSize}
					backgroundTransparency={0}
					clipsDescendants={true}
				>
					<uistroke Color={activeTheme.innerBorderColor} Thickness={rem(0.15)} />
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

					{/* Content area — centered, renders children */}
					<frame Size={frameSize} AutomaticSize={autoSize} BackgroundTransparency={1} ZIndex={2}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Center}
						/>
						{children}
					</frame>
				</Frame>
			</Frame>
		</ReactiveButton2>
	);
}

interface ShopButtonTextProps {
	readonly text: string;
	readonly theme?: ShopItemButtonTheme;
}

export function ShopButtonText({ text, theme = shopItemButtonThemes.blue }: ShopButtonTextProps) {
	const rem = useRem();
	const textStrokeGradient = new ColorSequence(theme.textStrokeFrom, theme.textStrokeTo);

	return (
		<frame AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)} BackgroundTransparency={1}>
			<uipadding PaddingLeft={CONTENT_PADDING} PaddingRight={CONTENT_PADDING} />
			<Text
				text={text}
				font={fonts.fredokaOne.regular}
				textColor={theme.textColor}
				textSize={rem(2.2)}
				size={new UDim2(0, 0, 1, 0)}
				textAutoResize="X"
				textXAlignment="Center"
				textYAlignment="Center"
			>
				<uistroke Thickness={rem(0.15)} Color={palette.white}>
					<uigradient Color={textStrokeGradient} Rotation={90} />
				</uistroke>
			</Text>
		</frame>
	);
}

export function ShopButtonIcon({ icon }: { icon: string }) {
	const rem = useRem();

	return (
		<frame AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)} BackgroundTransparency={1}>
			<uipadding PaddingLeft={new UDim(0, rem(0.6))} PaddingRight={new UDim(0, rem(0.6))} />
			<Image image={icon} size={new UDim2(0, rem(3), 0, rem(3))} scaleType="Fit" />
		</frame>
	);
}

interface ShopButtonTextWithIconProps {
	readonly text: string;
	readonly icon: string;
	readonly theme?: ShopItemButtonTheme;
}

export function ShopButtonTextWithIcon({ text, icon, theme = shopItemButtonThemes.blue }: ShopButtonTextWithIconProps) {
	const rem = useRem();
	const textStrokeGradient = new ColorSequence(theme.textStrokeFrom, theme.textStrokeTo);

	return (
		<frame AutomaticSize={Enum.AutomaticSize.X} Size={new UDim2(0, 0, 1, 0)} BackgroundTransparency={1}>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, rem(0.25))}
			/>
			<uipadding PaddingLeft={CONTENT_PADDING_LEFT_WITH_ICON} PaddingRight={CONTENT_PADDING} />
			<Image image={icon} size={new UDim2(0, rem(3), 0, rem(3))} scaleType="Fit" />
			<Text
				text={text}
				font={fonts.fredokaOne.regular}
				textColor={palette.white}
				textSize={rem(2.2)}
				size={new UDim2(0, 0, 1, 0)}
				textAutoResize="X"
				textXAlignment="Center"
				textYAlignment="Center"
			>
				<uistroke Thickness={rem(0.15)} Color={palette.white}>
					<uigradient Color={textStrokeGradient} Rotation={90} />
				</uistroke>
			</Text>
		</frame>
	);
}

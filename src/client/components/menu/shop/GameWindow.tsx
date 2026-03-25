import React from "@rbxts/react";
import { VStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { BORDER_GRADIENT, palette } from "shared/constants/palette";

const WINDOW_OUTER_BORDER = Color3.fromHex("#000000");
const DARK_BORDER_THICKNESS = 0.2;
const BORDER_THICKNESS = 0.3;

const styles = {
	default: {
		windowBg: Color3.fromHex("#3a90dd"),
		contentBg: Color3.fromHex("#00334e"),
		contentBorderGradient: BORDER_GRADIENT,
		contentOuterBorder: palette.darkBorderColor,
		windowBgImage: assets.ui.clouds_bg,
		windowBgScaleType: Enum.ScaleType.Crop as Enum.ScaleType,
		windowBgTileSize: undefined as UDim2 | undefined,
		windowBgTint: undefined as Color3 | undefined,
		windowBgGradient: undefined as ColorSequence | undefined,
		contentBgImage: assets.ui.shop.shop_room_bg,
		contentBgTileSize: new UDim2(0, 256, 0, 256),
		contentBgTint: undefined as Color3 | undefined,
	},
	progress: {
		windowBg: Color3.fromHex("#6cbaff"),
		contentBg: Color3.fromHex("#76f4ff"),
		contentBorderGradient: new ColorSequence([
			new ColorSequenceKeypoint(0, Color3.fromHex("#C1E3FF")),
			new ColorSequenceKeypoint(0.5, Color3.fromHex("#43B9F7")),
			new ColorSequenceKeypoint(1, Color3.fromHex("#326FB6")),
		]),
		contentOuterBorder: palette.darkBorderColor,
		windowBgImage: assets.ui.patterns.progress_window_bg,
		windowBgScaleType: Enum.ScaleType.Tile as Enum.ScaleType,
		windowBgTileSize: new UDim2(0, 1024, 0, 1024),
		windowBgTint: Color3.fromHex("#76f4ff"),
		windowBgGradient: new ColorSequence(Color3.fromHex("#6cbaff"), Color3.fromHex("#088aff")),
		contentBgImage: assets.ui.patterns.progress_content_bg,
		contentBgTileSize: new UDim2(0, 1024, 0, 1024),
		contentBgTint: Color3.fromHex("#76f4ff"),
	},
};

export type GameWindowVariant = "default" | "progress";

interface GameWindowProps {
	readonly header: React.Element;
	readonly children: React.Element;
	readonly variant?: GameWindowVariant;
}

export function GameWindow({ header, children, variant = "default" }: GameWindowProps) {
	const rem = useRem();
	const s = styles[variant];

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
				backgroundColor={s.windowBg}
				backgroundTransparency={0}
				size={new UDim2(1, 0, 0, 0)}
				automaticSize={Enum.AutomaticSize.Y}
			>
				<uicorner CornerRadius={windowRadius} />
				<uistroke
					Color={palette.darkBorderColor}
					Thickness={rem(DARK_BORDER_THICKNESS + BORDER_THICKNESS)}
					ZIndex={1}
				/>
				<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
					<uigradient Color={BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				{s.windowBgGradient && <uigradient Color={s.windowBgGradient} Rotation={90} />}

				<imagelabel
					Image={s.windowBgImage}
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					ScaleType={s.windowBgScaleType}
					TileSize={s.windowBgTileSize}
					ImageTransparency={0}
					ImageColor3={s.windowBgTint}
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
						backgroundColor={s.contentBg}
						backgroundTransparency={0}
						size={new UDim2(1, 0, 0, 0)}
						automaticSize={Enum.AutomaticSize.Y}
					>
						<uicorner CornerRadius={contentRadius} />
						<uistroke Color={s.contentOuterBorder} Thickness={rem(DARK_BORDER_THICKNESS)} ZIndex={2} />
						<uistroke
							Color={palette.white}
							Thickness={rem(BORDER_THICKNESS + DARK_BORDER_THICKNESS)}
							ZIndex={1}
						>
							<uigradient Color={s.contentBorderGradient} Rotation={-90} />
						</uistroke>

						<imagelabel
							Image={s.contentBgImage}
							BackgroundTransparency={1}
							Size={new UDim2(1, 0, 1, 0)}
							ScaleType={Enum.ScaleType.Tile}
							TileSize={s.contentBgTileSize}
							ImageTransparency={0}
							ImageColor3={s.contentBgTint}
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

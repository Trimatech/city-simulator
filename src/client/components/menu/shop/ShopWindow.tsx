import React, { useState } from "@rbxts/react";
import { useRem } from "client/hooks";
import { CloseButton } from "client/ui/buttons/CloseButton";
import { Frame } from "client/ui/layout/frame";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

import { SkinsList } from "../skins/SkinsList";
import { CashProducts } from "./CashProducts";
import { ShopItemButton } from "./ShopItemButton";

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

enum ShopTabs {
	Skins,
	Cash,
	Crystals,
}

interface ShopWindowProps {
	readonly onClose?: () => void;
}

export function ShopWindow({ onClose }: ShopWindowProps) {
	const rem = useRem();
	const [activeTabId, setActiveTabId] = useState(ShopTabs.Cash);

	const windowRadius = new UDim(0, rem(2.8));
	const contentRadius = new UDim(0, rem(1.5));

	const padTop = rem(1.75);
	const padSide = rem(1.9);
	const tabH = rem(4);
	const tabGap = rem(1);
	const contentTop = padTop + tabH + tabGap;

	return (
		// Outer border wrapper (3px black)
		<Frame
			size={new UDim2(0.9, 0, 0.9, 0)}
			name="ShopWindow"
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			backgroundColor={WINDOW_OUTER_BORDER}
			backgroundTransparency={0}
			cornerRadius={windowRadius}
		>
			{/* Inner window (4px #c1e3ff border + cloud bg) */}
			<frame BackgroundColor3={WINDOW_BG} BackgroundTransparency={0} Size={new UDim2(1, 0, 1, 0)}>
				<uicorner CornerRadius={windowRadius} />
				<uistroke
					Color={DARK_BORDER_COLOR}
					Thickness={rem(DARK_BORDER_THICKNESS + BORDER_THICKNESS)}
					ZIndex={1}
				/>
				<uistroke Color={palette.white} Thickness={rem(BORDER_THICKNESS)} ZIndex={2}>
					<uigradient Color={BORDER_GRADIENT} Rotation={90} />
				</uistroke>

				{/* Cloud background image */}
				<imagelabel
					Image={assets.ui.clouds_bg}
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					ScaleType={Enum.ScaleType.Crop}
					ImageTransparency={0}
				>
					<uicorner CornerRadius={windowRadius} />
				</imagelabel>

				{/* Tabs row */}
				<frame
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 0, tabH)}
					Position={new UDim2(0, padSide, 0, padTop)}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Left}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, rem(1))}
						SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					<ShopItemButton
						text="SKINS"
						icon={assets.ui.shop.Skins}
						fitContent={true}
						layoutOrder={1}
						onClick={() => setActiveTabId(ShopTabs.Skins)}
					/>
					<ShopItemButton
						text="CASH"
						icon={assets.ui.shop.Cash}
						fitContent={true}
						layoutOrder={2}
						onClick={() => setActiveTabId(ShopTabs.Cash)}
					/>
					<ShopItemButton
						text="CRYSTALS"
						icon={assets.ui.shards_icon_color}
						fitContent={true}
						layoutOrder={3}
						onClick={() => setActiveTabId(ShopTabs.Crystals)}
					/>
				</frame>

				{/* Content area */}
				<frame
					BackgroundColor3={DARK_BG}
					BackgroundTransparency={0}
					Size={new UDim2(1, -(padSide * 2), 1, -(contentTop + padSide))}
					Position={new UDim2(0, padSide, 0, contentTop)}
					BorderSizePixel={0}
				>
					<uicorner CornerRadius={contentRadius} />

					<uistroke Color={DARK_BORDER_COLOR} Thickness={rem(DARK_BORDER_THICKNESS)} ZIndex={2} />
					<uistroke
						Color={palette.white}
						Thickness={rem(BORDER_THICKNESS + DARK_BORDER_THICKNESS)}
						ZIndex={1}
					>
						<uigradient Color={BORDER_GRADIENT} Rotation={-90} />
					</uistroke>

					{/* Wavy stripes background texture */}
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
					{activeTabId === ShopTabs.Skins && <SkinsList />}
					{activeTabId === ShopTabs.Cash && <CashProducts />}
				</frame>

				{/* Close button */}
				<CloseButton
					onClick={onClose}
					anchorPoint={new Vector2(1, 0)}
					position={new UDim2(1, -rem(2), 0, rem(2))}
				/>
			</frame>
		</Frame>
	);
}

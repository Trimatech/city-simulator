import React from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import { SCROLLBAR_COLOR, SCROLLBAR_THICKNESS, SCROLLBAR_TRANSPARENCY } from "client/ui/scrollbar.constants";
import assets from "shared/assets";
import { DevProduct } from "shared/assetsFolder";

import { ShopItem, shopItemThemes } from "./ShopItem";

function promptPurchase(productId: number) {
	MarketplaceService.PromptProductPurchase(Players.LocalPlayer, productId);
}

export function CrystalProducts() {
	const rem = useRem();

	const colSpacing = rem(1.5);
	const rowSpacing = rem(4); // extra space to accommodate button overflow (~rem(3))
	const topPad = rem(1.5);
	const botPad = rem(4);

	const itemWidth = rem(20);
	const smallItemH = rem(15);
	const largeItemH = rem(20);

	const gridWidth = 3 * itemWidth + 2 * colSpacing;
	const gridHeight = smallItemH + rowSpacing + largeItemH;
	const canvasHeight = topPad + gridHeight + botPad;

	return (
		<Frame size={new UDim2(1, 0, 1, 0)}>
			<scrollingframe
				CanvasSize={new UDim2(0, gridWidth, 0, canvasHeight)}
				AutomaticCanvasSize={Enum.AutomaticSize.None}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ScrollBarThickness={rem(SCROLLBAR_THICKNESS)}
				ScrollBarImageColor3={SCROLLBAR_COLOR}
				ScrollBarImageTransparency={SCROLLBAR_TRANSPARENCY}
				ScrollingDirection={Enum.ScrollingDirection.Y}
				ClipsDescendants={true}
				AnchorPoint={new Vector2(0.5, 0)}
				Size={new UDim2(1, 0, 1, 0)}
				Position={new UDim2(0.5, 0, 0, 0)}
			>
				{/* Grid container, centered horizontally */}
				<frame
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0)}
					Size={new UDim2(0, gridWidth, 0, gridHeight)}
					Position={new UDim2(0.5, 0, 0, topPad)}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Vertical}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Top}
						Padding={new UDim(0, rowSpacing)}
					/>

					{/* Row 1: 3 smaller items */}
					<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, smallItemH)}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Top}
							Padding={new UDim(0, colSpacing)}
						/>
						<ShopItem
							title="1 Crystal"
							label="STARTER"
							buttonText="10"
							icon={assets.ui.crystals.crystals_1}
							theme={shopItemThemes.green}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.CRYSTALS_1)}
						/>
						<ShopItem
							title="5 Crystals"
							subtitle="+1 Bonus"
							label="CRYSTAL PACK"
							buttonText="40"
							icon={assets.ui.crystals.crystals_5}
							theme={shopItemThemes.green}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.CRYSTALS_5)}
						/>
						<ShopItem
							title="15 Crystals"
							subtitle="+3 Bonus"
							label="SHARD CRATE"
							buttonText="100"
							icon={assets.ui.crystals.crystals_15}
							theme={shopItemThemes.orange}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.CRYSTALS_15)}
						/>
					</frame>

					{/* Row 2: 2 larger items */}
					<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, largeItemH)}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Top}
							Padding={new UDim(0, colSpacing)}
						/>
						<ShopItem
							title="25 Crystals"
							subtitle="+5 Bonus"
							label="CRYSTAL VAULT"
							buttonText="200"
							icon={assets.ui.crystals.crystals_25}
							theme={shopItemThemes.blue}
							size={new UDim2(0, itemWidth, 0, largeItemH)}
							onButtonClick={() => promptPurchase(DevProduct.CRYSTALS_25)}
						/>
					</frame>
				</frame>
			</scrollingframe>
		</Frame>
	);
}

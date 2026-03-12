import React from "@rbxts/react";
import { MarketplaceService, Players } from "@rbxts/services";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";
import { DevProduct } from "shared/assetsFolder";

import { ShopItem, shopItemThemes } from "./ShopItem";

function promptPurchase(productId: number) {
	MarketplaceService.PromptProductPurchase(Players.LocalPlayer, productId);
}

export function CashProducts() {
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
				ScrollBarThickness={0}
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
							title="$100 Cash"
							subtitle="+10 Bonus"
							label="STARTER PACK"
							buttonText="10"
							icon={assets.ui.shop.Cash100Large}
							theme={shopItemThemes.green}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.MONEY_100)}
						/>
						<ShopItem
							title="$500 Cash"
							subtitle="+100 Bonus"
							label="BONUS BOOST"
							buttonText="50"
							icon={assets.ui.shop.Cash500Large}
							theme={shopItemThemes.green}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.MONEY_500)}
						/>
						<ShopItem
							title="$2500 Cash"
							subtitle="+200 Bonus"
							label="WEALTH CRATE"
							buttonText="200"
							icon={assets.ui.shop.Cash250Large}
							theme={shopItemThemes.orange}
							size={new UDim2(0, itemWidth, 0, smallItemH)}
							onButtonClick={() => promptPurchase(DevProduct.MONEY_2500)}
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
							title="$10K Cash"
							subtitle="+10K Bonus"
							label="TREASURE CHEST"
							buttonText="500"
							icon={assets.ui.shop.Cash10kLarge}
							theme={shopItemThemes.orange}
							size={new UDim2(0, itemWidth, 0, largeItemH)}
							onButtonClick={() => promptPurchase(DevProduct.MONEY_10000)}
						/>
						<ShopItem
							title="$100K Cash"
							subtitle="+10K Bonus"
							label="BANK VAULT"
							buttonText="2000"
							icon={assets.ui.shop.Cash100kLarge}
							theme={shopItemThemes.blue}
							size={new UDim2(0, itemWidth, 0, largeItemH)}
							onButtonClick={() => promptPurchase(DevProduct.MONEY_100000)}
						/>
					</frame>
				</frame>
			</scrollingframe>
		</Frame>
	);
}

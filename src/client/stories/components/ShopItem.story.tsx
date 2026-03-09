import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps } from "@rbxts/ui-labs";
import { ShopItem, shopItemThemes } from "client/components/menu/shop/ShopItem";
import { RootProvider } from "client/providers/root-provider";
import assets from "shared/assets";

const controls = {};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (_props: InferFusionProps<typeof controls>) => {
		return (
			<RootProvider>
				<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 24)}
					/>

					{/* Orange variant */}
					<ShopItem
						title="$100 Cash"
						subtitle="+10 Bonus"
						label="STARTER PACK"
						buttonText="10"
						icon={assets.ui.shop.Cash100Large}
						theme={shopItemThemes.orange}
					/>

					<ShopItem
						title="$500 Cash"
						subtitle="+50 Bonus"
						label="BONUS BOOST"
						buttonText="50"
						icon={assets.ui.shop.Cash500Large}
						theme={shopItemThemes.orange}
					/>

					<ShopItem
						title="$2500 Cash"
						subtitle="+200 Bonus"
						label="WEALTH CRATE"
						buttonText="200"
						icon={assets.ui.shop.Cash250Large}
						theme={shopItemThemes.orange}
					/>

					<ShopItem
						title="$10K Cash"
						subtitle="+10K Bonus"
						label="TREASURE CHEST"
						buttonText="500"
						icon={assets.ui.shop.Cash10kLarge}
						theme={shopItemThemes.orange}
					/>

					{/* Blue variant */}
					<ShopItem
						title="$100K Cash"
						subtitle="+100K Bonus"
						label="BANK VAULT"
						buttonText="2000"
						icon={assets.ui.shop.Cash100kLarge}
						theme={shopItemThemes.blue}
					/>
				</frame>
			</RootProvider>
		);
	},
};

export = story;

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
				<frame
					Size={new UDim2(1, 0, 1, 0)}
					BackgroundTransparency={1}
				>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 24)}
					/>

					{/* Orange variant */}
					<ShopItem
						title="$10K Cash"
						subtitle="+10K Bonus"
						label="TREASURE CHEST"
						buttonText="2000"
						icon={assets.ui.shop_treasure_chest}
						theme={shopItemThemes.orange}
					/>

					{/* Blue variant */}
					<ShopItem
						title="$10K Cash"
						subtitle="+10K Bonus"
						label="TREASURE CHEST"
						buttonText="2000"
						icon={assets.ui.shop_treasure_chest}
						theme={shopItemThemes.blue}
					/>
				</frame>
			</RootProvider>
		);
	},
};

export = story;

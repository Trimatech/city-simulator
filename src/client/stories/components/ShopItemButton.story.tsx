import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps } from "@rbxts/ui-labs";
import { ShopItemButton } from "client/components/menu/shop/ShopItemButton";
import { RootProvider } from "client/providers/root-provider";

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
						FillDirection={Enum.FillDirection.Vertical}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 16)}
					/>

					<ShopItemButton text="2000" />

					<ShopItemButton text="BUY NOW" />
				</frame>
			</RootProvider>
		);
	},
};

export = story;

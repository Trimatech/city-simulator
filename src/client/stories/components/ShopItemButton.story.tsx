import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps } from "@rbxts/ui-labs";
import { RootProvider } from "client/providers/root-provider";
import { MainButton, ShopButtonText, ShopButtonTextWithIcon } from "client/ui/MainButton";
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
						FillDirection={Enum.FillDirection.Vertical}
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Center}
						Padding={new UDim(0, 16)}
					/>

					{/* Fixed width (default) */}
					<MainButton>
						<ShopButtonText text="2000" />
					</MainButton>

					<MainButton>
						<ShopButtonText text="BUY NOW" />
					</MainButton>

					<MainButton>
						<ShopButtonTextWithIcon text="CRYSTALS" icon={assets.ui.shards_icon_color} />
					</MainButton>

					{/* Dynamic width — shrinks to content */}
					<MainButton fitContent>
						<ShopButtonText text="2000" />
					</MainButton>

					<MainButton fitContent>
						<ShopButtonText text="BUY NOW" />
					</MainButton>

					<MainButton fitContent>
						<ShopButtonTextWithIcon text="CRYSTALS" icon={assets.ui.shards_icon_color} />
					</MainButton>
				</frame>
			</RootProvider>
		);
	},
};

export = story;

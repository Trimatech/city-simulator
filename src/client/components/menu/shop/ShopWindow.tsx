import React, { useState } from "@rbxts/react";
import { HFill } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { SkinsList } from "../skins/SkinsList";
import { CashProducts } from "./CashProducts";
import { GameWindow } from "./GameWindow";
import { GameWindowTabsHeader } from "./GameWindowTabsHeader";
import { ShopItemButton } from "./ShopItemButton";

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

	const tabs = (
		<>
			<ShopItemButton
				text="SKINS"
				icon={assets.ui.shop.Skins}
				fitContent={true}
				onClick={() => setActiveTabId(ShopTabs.Skins)}
			/>
			<ShopItemButton
				text="CASH"
				icon={assets.ui.shop.Cash}
				fitContent={true}
				onClick={() => setActiveTabId(ShopTabs.Cash)}
			/>
			<ShopItemButton
				text="CRYSTALS"
				icon={assets.ui.shards_icon_color}
				fitContent={true}
				onClick={() => setActiveTabId(ShopTabs.Crystals)}
			/>
			<HFill verticalSize={0} />
		</>
	);

	return (
		<GameWindow header={<GameWindowTabsHeader tabs={tabs} onClose={onClose} />}>
			<Frame size={new UDim2(1, 0, 0, rem(45))}>
				{activeTabId === ShopTabs.Skins && <SkinsList />}
				{activeTabId === ShopTabs.Cash && <CashProducts />}
			</Frame>
		</GameWindow>
	);
}

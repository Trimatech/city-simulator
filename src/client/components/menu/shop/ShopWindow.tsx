import React, { useState } from "@rbxts/react";
import { HFill } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { MainButton, ShopButtonTextWithIcon } from "../../../ui/MainButton";
import { SkinsList } from "../skins/SkinsList";
import { CashProducts } from "./CashProducts";
import { CrystalProducts } from "./CrystalProducts";
import { GameWindow } from "./GameWindow";
import { GameWindowTabsHeader } from "./GameWindowTabsHeader";

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
			<MainButton
				fitContent
				isActive={activeTabId === ShopTabs.Skins}
				onClick={() => setActiveTabId(ShopTabs.Skins)}
			>
				<ShopButtonTextWithIcon text="SKINS" icon={assets.ui.shop.Skins} />
			</MainButton>
			<MainButton
				fitContent
				isActive={activeTabId === ShopTabs.Cash}
				onClick={() => setActiveTabId(ShopTabs.Cash)}
			>
				<ShopButtonTextWithIcon text="CASH" icon={assets.ui.shop.Cash} />
			</MainButton>
			<MainButton
				fitContent
				isActive={activeTabId === ShopTabs.Crystals}
				onClick={() => setActiveTabId(ShopTabs.Crystals)}
			>
				<ShopButtonTextWithIcon text="CRYSTALS" icon={assets.ui.shards_icon_color} />
			</MainButton>
			<HFill verticalSize={0} />
		</>
	);

	return (
		<GameWindow header={<GameWindowTabsHeader tabs={tabs} onClose={onClose} />}>
			<Frame size={new UDim2(1, 0, 0, rem(45))}>
				{activeTabId === ShopTabs.Skins && <SkinsList />}
				{activeTabId === ShopTabs.Cash && <CashProducts />}
				{activeTabId === ShopTabs.Crystals && <CrystalProducts />}
			</Frame>
		</GameWindow>
	);
}

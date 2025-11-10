import React, { useState } from "@rbxts/react";
import { SupportProducts } from "client/components/menu/support/support-products";
import { Tabs } from "client/components/tabs/Tabs";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";

import { SkinsList } from "../skins/SkinsList";

enum ShopTabs {
	Skins,
	Currency,
}

const tabs = [
	{ text: "Skins", id: ShopTabs.Skins, emoji: "🎨" },
	{ text: "Currency", id: ShopTabs.Currency, emoji: "💵" },
];

export function ShopWindow() {
	const rem = useRem();
	const headerHeight = rem(10);

	const [activeTabId, setActiveTabId] = useState(ShopTabs.Skins);

	return (
		<Frame size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} name="ShopWindow">
			<Tabs tabs={tabs} activeTabId={activeTabId as number} setActiveTabId={setActiveTabId} />

			<Frame
				size={new UDim2(1, 0, 1, -headerHeight)}
				position={new UDim2(0, 0, 0, headerHeight)}
				backgroundTransparency={1}
				name="ShopContent"
				clipsDescendants={true}
			>
				{activeTabId === ShopTabs.Skins && <SkinsList />}
				{activeTabId === ShopTabs.Currency && <SupportProducts />}
			</Frame>
		</Frame>
	);
}

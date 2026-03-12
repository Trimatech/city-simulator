import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { useRem } from "client/ui/rem/useRem";
import assets from "shared/assets";

import { ShopItemButton } from "./ShopItemButton";

interface GameWindowTabsHeaderProps {
	readonly tabs: React.Element;
	readonly onClose?: () => void;
}

export function GameWindowTabsHeader({ tabs, onClose }: GameWindowTabsHeaderProps) {
	const rem = useRem();

	return (
		<HStack spacing={rem(1)} size={new UDim2(1, 0, 0, 0)} automaticSize={Enum.AutomaticSize.Y}>
			{tabs}
			<ShopItemButton icon={assets.ui.shop.Close} onClick={onClose} />
		</HStack>
	);
}

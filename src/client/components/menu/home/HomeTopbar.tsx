import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { ROBLOX_TOOLBAR_HEIGHT } from "client/constants/roblox.constants";
import { store } from "client/store";
import { MenuWindow } from "client/store/screen";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";

interface HomeTopbarProps {
	visible: boolean;
}

export function HomeTopbar({ visible }: HomeTopbarProps) {
	const rem = useRem();

	return (
		<SlideIn visible={visible} direction="left">
			<HStack
				verticalAlignment={Enum.VerticalAlignment.Center}
				spacing={rem(1)}
				padding={rem(1)}
				size={new UDim2(1, 0, 0, ROBLOX_TOOLBAR_HEIGHT)}
			>
				<MainButton
					onClick={() => store.setOpenMenuWindow(MenuWindow.Shop)}
					size={new UDim2(0, rem(10), 0, rem(4))}
					fitContent
				>
					<ShopButtonTextWithIcon text="Shop" icon={assets.ui.icons.store} />
				</MainButton>
				<MainButton
					onClick={() => store.setOpenMenuWindow(MenuWindow.DailyReward)}
					size={new UDim2(0, rem(16), 0, rem(4))}
					fitContent
				>
					<ShopButtonTextWithIcon text="Daily Rewards" icon={assets.ui.icons.dailyRewards} />
				</MainButton>
				<MainButton
					onClick={() => store.setOpenMenuWindow(MenuWindow.Progress)}
					size={new UDim2(0, rem(13), 0, rem(4))}
					fitContent
				>
					<ShopButtonTextWithIcon text="Progress" icon={assets.ui.icons.rank} />
				</MainButton>
			</HStack>
		</SlideIn>
	);
}

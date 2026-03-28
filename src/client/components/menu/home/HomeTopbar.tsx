import React from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { HStack } from "@rbxts-ui/layout";
import { ROBLOX_TOOLBAR_HEIGHT } from "client/constants/roblox.constants";
import { store } from "client/store";
import { MenuWindow } from "client/store/screen";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { SECONDS_PER_DAY } from "shared/constants/daily-rewards";
import { selectPlayerLastDailyRewardClaim } from "shared/store/saves/save-selectors";

interface HomeTopbarProps {
	visible: boolean;
}

export function HomeTopbar({ visible }: HomeTopbarProps) {
	const rem = useRem();
	const lastClaimTime = useSelectorCreator(selectPlayerLastDailyRewardClaim, USER_NAME);

	const elapsed = os.time() - lastClaimTime;
	const canClaim = lastClaimTime === 0 || elapsed >= SECONDS_PER_DAY;

	return (
		<SlideIn visible={visible} direction="top">
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
					showNotificationDot={canClaim}
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

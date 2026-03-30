import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { AdminToggleButton } from "client/components/game/admin/AdminToggleButton";
import { HealthView } from "client/components/game/health/HealthView";
import { Stats } from "client/components/stats/Stats";
import { ROBLOX_TOOLBAR_HEIGHT } from "client/constants/roblox.constants";
import { useIsMobile } from "client/hooks";
import { store } from "client/store";
import { MenuWindow } from "client/store/screen";
import { MainButton, ShopButtonIcon, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";
import { IS_ADMIN } from "shared/constants/admin";

interface GameTopbarProps {
	visible: boolean;
}

export function GameTopbar({ visible }: GameTopbarProps) {
	const rem = useRem();
	const isMobile = useIsMobile();

	return (
		<SlideIn visible={visible} direction="top">
			<uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
			<HStack
				verticalAlignment={Enum.VerticalAlignment.Center}
				spacing={rem(1)}
				padding={rem(1)}
				size={new UDim2(1, 0, 0, ROBLOX_TOOLBAR_HEIGHT)}
			>
				{IS_ADMIN && <AdminToggleButton />}
				<MainButton
					onClick={() => store.setOpenMenuWindow(MenuWindow.Progress)}
					size={isMobile ? new UDim2(0, rem(4), 0, rem(4)) : new UDim2(0, rem(13), 0, rem(4))}
					fitContent={!isMobile}
				>
					{isMobile ? (
						<ShopButtonIcon icon={assets.ui.icons.rank} />
					) : (
						<ShopButtonTextWithIcon text="Progress" icon={assets.ui.icons.rank} />
					)}
				</MainButton>
				{isMobile && <Stats direction="horizontal" />}
				<HealthView />
			</HStack>
		</SlideIn>
	);
}

import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { HealthView } from "client/components/game/health/HealthView";
import { ROBLOX_TOOLBAR_HEIGHT } from "client/constants/roblox.constants";
import { store } from "client/store";
import { MenuWindow } from "client/store/screen";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";

interface GameTopbarProps {
	visible: boolean;
}

export function GameTopbar({ visible }: GameTopbarProps) {
	const rem = useRem();

	return (
		<SlideIn visible={visible} direction="top">
			<HStack
				verticalAlignment={Enum.VerticalAlignment.Center}
				spacing={rem(1)}
				padding={rem(1)}
				size={new UDim2(1, 0, 0, ROBLOX_TOOLBAR_HEIGHT)}
			>
				<MainButton
					onClick={() => store.setOpenMenuWindow(MenuWindow.Progress)}
					size={new UDim2(0, rem(13), 0, rem(4))}
					fitContent
				>
					<ShopButtonTextWithIcon text="Progress" icon={assets.ui.icons.rank} />
				</MainButton>
				<HealthView />
			</HStack>
		</SlideIn>
	);
}

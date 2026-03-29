import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { store } from "client/store";
import { MenuWindow, selectOpenMenuWindow } from "client/store/screen";
import { palette } from "shared/constants/palette";

import { DailyRewardScreen } from "./menu/daily-reward/DailyRewardScreen";
import { ProgressWindow } from "./menu/progress/ProgressWindow";
import { ShopWindow } from "./menu/shop/ShopWindow";

export function OverlayScreens() {
	const openMenuWindow = useSelector(selectOpenMenuWindow);

	if (openMenuWindow === undefined) {
		return undefined;
	}

	return (
		<>
			<textbutton
				key="backdrop"
				Size={new UDim2(1, 0, 1, 0)}
				BackgroundColor3={palette.teal}
				BackgroundTransparency={0.2}
				Text=""
				AutoButtonColor={false}
				Active={true}
			/>

			{openMenuWindow === MenuWindow.Shop && <ShopWindow onClose={() => store.setOpenMenuWindow(undefined)} />}

			{openMenuWindow === MenuWindow.DailyReward && (
				<DailyRewardScreen onDismiss={() => store.setOpenMenuWindow(undefined)} />
			)}

			{openMenuWindow === MenuWindow.Progress && (
				<ProgressWindow onClose={() => store.setOpenMenuWindow(undefined)} />
			)}
		</>
	);
}

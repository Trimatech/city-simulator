import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { store } from "client/store";
import { MenuWindow, selectOpenMenuWindow } from "client/store/screen";
import { Overlay } from "client/ui/Overlay";

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
			<Overlay onClick={() => store.setOpenMenuWindow(undefined)} />

			{openMenuWindow === MenuWindow.Shop && (
				<ShopWindow onClose={() => store.setOpenMenuWindow(undefined)} />
			)}

			{openMenuWindow === MenuWindow.DailyReward && (
				<DailyRewardScreen onDismiss={() => store.setOpenMenuWindow(undefined)} />
			)}

			{openMenuWindow === MenuWindow.Progress && (
				<ProgressWindow onClose={() => store.setOpenMenuWindow(undefined)} />
			)}
		</>
	);
}

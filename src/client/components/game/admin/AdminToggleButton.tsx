import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { store } from "client/store";
import { selectAdminPanelOpen } from "client/store/screen";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";

export function AdminToggleButton() {
	const rem = useRem();
	const adminPanelOpen = useSelector(selectAdminPanelOpen);

	return (
		<MainButton onClick={() => store.setAdminPanelOpen(!adminPanelOpen)} size={new UDim2(0, rem(4), 0, rem(4))}>
			<ShopButtonText text="🛡️" />
		</MainButton>
	);
}

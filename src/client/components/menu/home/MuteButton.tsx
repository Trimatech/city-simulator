import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { selectMusicEnabled } from "client/store/settings/settingsSelectors";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";

export function MuteButton() {
	const rem = useRem();
	const store = useStore();
	const musicEnabled = useSelector(selectMusicEnabled);

	return (
		<MainButton onClick={() => store.setMenuMusic(!musicEnabled)} size={new UDim2(0, rem(4), 0, rem(4))}>
			<ShopButtonText text={musicEnabled ? "🔊" : "🔇"} />
		</MainButton>
	);
}

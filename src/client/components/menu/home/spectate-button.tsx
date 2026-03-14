import { useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useStore } from "client/hooks";
import { selectWorldSpectating } from "client/store/world";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { cycleNextSoldier } from "shared/store/soldiers";

export function SpectateButton() {
	const rem = useRem();
	const store = useStore();
	const spectating = useSelector(selectWorldSpectating);

	const onClick = useThrottleCallback(
		() => {
			store.setWorldSpectating(store.getState(cycleNextSoldier(spectating)));
		},
		{ wait: 0.5, trailing: false },
	);

	return (
		<MainButton onClick={onClick.run} size={new UDim2(0, rem(4), 0, rem(4))}>
			<ShopButtonText text="🎥" />
		</MainButton>
	);
}

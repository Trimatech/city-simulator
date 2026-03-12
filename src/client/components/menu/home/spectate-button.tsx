import { useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useStore } from "client/hooks";
import { selectWorldSpectating } from "client/store/world";
import { MainButton } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
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
		<MainButton
			onClick={onClick.run}
			overlayGradient={new ColorSequence(palette.text)}
			size={new UDim2(0, rem(4), 0, rem(4))}
		>
			<Text font={fonts.inter.medium} text="🎥" textSize={rem(2)} size={new UDim2(1, 0, 1, 0)} />
		</MainButton>
	);
}

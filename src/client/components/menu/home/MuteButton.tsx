import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useStore } from "client/hooks";
import { selectMusicEnabled } from "client/store/settings/settingsSelectors";
import { MainButton } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

export function MuteButton() {
	const rem = useRem();
	const store = useStore();
	const musicEnabled = useSelector(selectMusicEnabled);

	return (
		<MainButton
			onClick={() => store.setMenuMusic(!musicEnabled)}
			overlayGradient={new ColorSequence(musicEnabled ? palette.text : palette.maroon)}
			size={new UDim2(0, rem(4), 0, rem(4))}
		>
			<Text
				font={fonts.inter.medium}
				text={musicEnabled ? "🔊" : "🔇"}
				textSize={rem(2)}
				size={new UDim2(1, 0, 1, 0)}
			/>
		</MainButton>
	);
}

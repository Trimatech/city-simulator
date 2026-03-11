import React from "@rbxts/react";
import { Text } from "@rbxts-ui/primitives";
import { useRem } from "client/hooks";
import { MainButton } from "client/ui/MainButton";
import { palette } from "shared/constants/palette";

export function CanvasButton({ text, onClick }: { text: string; onClick: () => void }) {
	const rem = useRem();

	return (
		<MainButton
			onClick={onClick}
			size={new UDim2(0, rem(10), 0, rem(4))}
			overlayGradient={new ColorSequence(palette.red, palette.blue)}
		>
			<Text position={new UDim2(0.5, 0, 0.5, 0)} textSize={rem(2)} textColor={palette.black} text={text} />
		</MainButton>
	);
}

import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import { palette } from "shared/constants/palette";

export function CanvasButton({ text, onClick }: { text: string; onClick: () => void }) {
	const rem = useRem();

	return (
		<PrimaryButton
			onClick={onClick}
			size={new UDim2(0, rem(10), 0, rem(4))}
			overlayGradient={new ColorSequence(palette.red, palette.blue)}
		>
			<Text position={new UDim2(0.5, 0, 0.5, 0)} textSize={rem(2)} textColor={palette.black} text={text} />
		</PrimaryButton>
	);
}

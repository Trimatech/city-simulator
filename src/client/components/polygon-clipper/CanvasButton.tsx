import React from "@rbxts/react";
import { MainButton, ShopButtonText } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";

export function CanvasButton({ text, onClick }: { text: string; onClick: () => void }) {
	const rem = useRem();

	return (
		<MainButton onClick={onClick} size={new UDim2(0, rem(10), 0, rem(4))}>
			<ShopButtonText text={text} />
		</MainButton>
	);
}

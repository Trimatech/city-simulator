import React, { useState } from "@rbxts/react";
import { useMotion, useRem } from "client/hooks";
import { ReactiveButton } from "client/ui/reactive-button";
import { playSound, sounds } from "shared/assets";
import { getWallSkin } from "shared/constants/skins";

import { SkinThumbnail } from "./SkinThumbnail";

interface SkinButtonProps {
	readonly id: string;
	readonly index: number;
	readonly active: boolean;
	readonly shuffle?: readonly string[];
	readonly onClick: () => void;
	readonly cellSize: number;
}

const SIZE = 12;

export function SkinButton({ id, index, active, shuffle, cellSize, onClick }: SkinButtonProps) {
	const [skin, setSkin] = useState(getWallSkin(id));

	const rem = useRem();

	const [transparency, transparencyMotion] = useMotion(0);

	const size = new UDim2(0, cellSize, 0, cellSize);

	return (
		<ReactiveButton
			onClick={() => {
				onClick();
				playSound(sounds.navigate);
			}}
			animateSizeStrength={2}
			animatePositionStrength={1.5}
			soundVariant="none"
			backgroundTransparency={1}
			anchorPoint={new Vector2(0.5, 1)}
			size={size}
			zIndex={-math.abs(index)}
		>
			<SkinThumbnail active={active} skin={skin} transparency={transparency} />
		</ReactiveButton>
	);
}

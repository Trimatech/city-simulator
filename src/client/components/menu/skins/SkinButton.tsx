import React, { useEffect, useState } from "@rbxts/react";
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
}

const SIZE = 12;
const SIZE_INACTIVE = 9.5;
const PADDING = 1.5;

function getPosition(rem: number, index: number) {
	const offset = math.sign(index) * (SIZE - SIZE_INACTIVE) * 0.5;
	const position = index * (SIZE + PADDING);

	return new UDim2(0.5, (position + offset) * rem, 1, 0);
}

function getSize(rem: number, active: boolean) {
	const sizeActive = new UDim2(0, SIZE * rem, 0, SIZE * rem);
	const sizeInactive = new UDim2(0, SIZE_INACTIVE * rem, 0, SIZE_INACTIVE * rem);

	return active ? sizeActive : sizeInactive;
}

export function SkinButton({ id, index, active, shuffle, onClick }: SkinButtonProps) {
	const [skin, setSkin] = useState(getWallSkin(id));

	const rem = useRem();

	const [position, positionMotion] = useMotion(getPosition(rem(1), math.sign(index) * 3));
	const [size, sizeMotion] = useMotion(getSize(rem(1), false));
	const [transparency, transparencyMotion] = useMotion(0);

	useEffect(() => {
		positionMotion.spring(getPosition(rem(1), index), {
			tension: 250,
			friction: 22,
			mass: 1 + math.abs(index / 2),
		});
		sizeMotion.spring(getSize(rem(1), index === 0));
	}, [rem, index]);

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
			position={position}
			zIndex={-math.abs(index)}
		>
			<SkinThumbnail active={active} skin={skin} transparency={transparency} />
		</ReactiveButton>
	);
}

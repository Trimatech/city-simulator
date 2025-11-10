import React, { useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { fonts } from "client/constants/fonts";
import { useMotion, useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { ReactiveButton } from "client/ui/reactive-button";
import { Shadow } from "client/ui/shadow";
import { Text } from "client/ui/text";
import { formatInteger } from "client/utils/format-integer";
import { playSound, sounds } from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { getWallSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { RANDOM_SKIN, selectCurrentPlayerSkin, selectPlayerBalance, selectPlayerSkins } from "shared/store/saves";

import { SkinThumbnail } from "./SkinThumbnail";

interface SkinButtonProps {
	readonly id: string;
	readonly index: number;
	readonly active: boolean;
	readonly shuffle?: readonly string[];
	readonly onClick: () => void;
	readonly cellSize: number;
}

export function SkinButton({ id, index, active, shuffle: _shuffle, cellSize, onClick }: SkinButtonProps) {
	const skin = getWallSkin(id);

	const rem = useRem();

	const [transparency, _transparencyMotion] = useMotion(0);

	const size = new UDim2(0, cellSize, 0, cellSize);

	const inventory = useSelectorCreator(selectPlayerSkins, USER_NAME) || [];
	const equipped = useSelectorCreator(selectCurrentPlayerSkin, USER_NAME) ?? RANDOM_SKIN;
	const balance = useSelectorCreator(selectPlayerBalance, USER_NAME) ?? 0;

	const owns = inventory.includes(id);
	const isEquipped = equipped === id;
	const canAfford = balance >= skin.price;

	const actionLabel = useMemo(() => {
		if (owns) {
			return isEquipped ? "Equipped" : "Equip";
		}

		const priceText = "$" + formatInteger(skin.price);
		return canAfford ? `Buy ${priceText}` : `Locked ${priceText}`;
	}, [owns, isEquipped, canAfford, skin.price]);

	const onAction = () => {
		if (owns) {
			if (!isEquipped) {
				remotes.save.setSkin.fire(id);
			}
		} else if (canAfford) {
			remotes.save.buySkin.fire(id);
		} else {
			// do nothing; optionally could alert here
		}
	};

	const corner = new UDim(0, rem(1.5));

	return (
		<Frame size={size} backgroundTransparency={1}>
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
				{/* Card background */}
				<Shadow
					shadowColor={palette.white}
					shadowBlur={0.3}
					shadowPosition={rem(0.5)}
					shadowSize={rem(2)}
					shadowTransparency={0.7}
				/>
				<Frame
					backgroundColor={palette.black}
					backgroundTransparency={0.7}
					cornerRadius={corner}
					size={new UDim2(1, 0, 1, 0)}
				>
					<Outline cornerRadius={corner} />
				</Frame>

				{/* Thumbnail area */}
				<Frame size={new UDim2(1, 0, 1, 0)} backgroundTransparency={1} position={new UDim2(0, 0, 0, 0)}>
					<SkinThumbnail active={active} skin={skin} transparency={transparency} />
				</Frame>

				{/* Title */}
				<Text
					text={skin.id}
					textSize={rem(1.2)}
					textColor={palette.white}
					size={new UDim2(1, -rem(2), 0, rem(2))}
					position={new UDim2(0, rem(1), 0, rem(cellSize - 4))}
					textXAlignment="Left"
					textYAlignment="Center"
					font={fonts.inter.regular}
				/>

				{/* Action */}
				<PrimaryButton
					onClick={onAction}
					enabled={owns ? !isEquipped : canAfford}
					size={new UDim2(1, -rem(2), 0, rem(3))}
					position={new UDim2(0, rem(1), 1, -rem(3.5))}
					anchorPoint={new Vector2(0, 1)}
				>
					<Text
						text={actionLabel}
						textSize={rem(1.4)}
						textColor={palette.black}
						position={new UDim2(0.5, 0, 0.5, 0)}
						anchorPoint={new Vector2(0.5, 0.5)}
						font={fonts.inter.medium}
					/>
				</PrimaryButton>
			</ReactiveButton>
		</Frame>
	);
}

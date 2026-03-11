import React, { useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { ReactiveButton } from "@rbxts-ui/components";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useMotion, useRem } from "client/hooks";
import { MainButton } from "client/ui/MainButton";
import { formatInteger } from "client/utils/format-integer";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { USER_NAME } from "shared/constants/core";
import { palette } from "shared/constants/palette";
import { getWallSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { RANDOM_SKIN, selectCurrentPlayerSkin, selectPlayerBalance, selectPlayerSkins } from "shared/store/saves";
import { capitalizeFirst } from "shared/utils/text-utils";

import { SkinThumbnail } from "./SkinThumbnail";

interface SkinButtonProps {
	readonly id: string;
	readonly cellSize: number;
}

export function SkinButton({ id, cellSize }: SkinButtonProps) {
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
			return isEquipped ? "EQUIPPED" : "EQUIP";
		}

		const priceText = "$" + formatInteger(skin.price);
		return canAfford ? `${priceText}` : `${priceText}`;
	}, [owns, isEquipped, canAfford, skin.price]);

	const actionColor = useMemo(() => {
		if (owns) {
			return isEquipped ? palette.green : palette.blue;
		}
		return canAfford ? palette.teal : palette.red;
	}, [owns, isEquipped, canAfford]);

	const onAction = () => {
		playSound(assets.sounds.navigate);
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
		<ReactiveButton
			animateSizeStrength={2}
			animatePositionStrength={1.5}
			backgroundTransparency={1}
			anchorPoint={new Vector2(0.5, 1)}
			size={size}
		>
			<Frame
				backgroundColor={skin.tint}
				backgroundTransparency={0.7}
				cornerRadius={corner}
				size={new UDim2(1, 0, 1, 0)}
			/>

			<VStack
				horizontalAlignment={Enum.HorizontalAlignment.Center}
				verticalAlignment={Enum.VerticalAlignment.Center}
				padding={rem(1)}
			>
				{/* Title */}
				<Text
					text={capitalizeFirst(skin.id)}
					textSize={rem(1.5)}
					textColor={palette.dark}
					size={new UDim2(1, 0, 0, rem(2))}
					position={new UDim2(0, 0, 0, 0)}
					textXAlignment="Center"
					textYAlignment="Center"
					font={fonts.inter.bold}
				>
					<uistroke Color={palette.white} Transparency={0} Thickness={rem(0.2)} />
				</Text>
				{/* Thumbnail area */}
				<Frame size={new UDim2(1, 0, 0.7, 0)} backgroundTransparency={1} position={new UDim2(0, 0, 0, 0)}>
					<SkinThumbnail active={false} skin={skin} transparency={transparency} />
				</Frame>

				{/* Action */}
				<MainButton onClick={onAction} primaryColor={actionColor} size={new UDim2(1, 0, 0, rem(3))}>
					<Text
						text={actionLabel}
						textSize={rem(1.4)}
						textColor={palette.dark}
						position={new UDim2(0.5, 0, 0.5, 0)}
						anchorPoint={new Vector2(0.5, 0.5)}
						font={fonts.inter.regular}
					/>
				</MainButton>
			</VStack>
		</ReactiveButton>
	);
}

import React, { useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { Frame } from "@rbxts-ui/primitives";
import { useMotion } from "client/hooks";
import { formatInteger } from "client/utils/format-integer";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { USER_NAME } from "shared/constants/core";
import { getWallSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { RANDOM_SKIN, selectCurrentPlayerSkin, selectPlayerBalance, selectPlayerSkins } from "shared/store/saves";
import { capitalizeFirst } from "shared/utils/text-utils";

import { ShopItem, shopItemThemes } from "../shop/ShopItem";
import { SkinThumbnail } from "./SkinThumbnail";

interface SkinButtonProps {
	readonly id: string;
	readonly cellSize: number;
}

export function SkinButton({ id, cellSize }: SkinButtonProps) {
	const skin = getWallSkin(id);

	const [transparency, _transparencyMotion] = useMotion(0);

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

	const onAction = () => {
		playSound(assets.sounds.navigate);
		if (owns) {
			if (!isEquipped) {
				remotes.save.setSkin.fire(id);
			}
		} else if (canAfford) {
			remotes.save.buySkin.fire(id);
		}
	};

	const theme = useMemo(() => {
		if (owns) {
			return isEquipped ? shopItemThemes.green : shopItemThemes.blue;
		}
		return shopItemThemes.orange;
	}, [owns, isEquipped]);

	return (
		<ShopItem
			title={capitalizeFirst(skin.id)}
			buttonText={actionLabel}
			theme={theme}
			onButtonClick={onAction}
			size={new UDim2(0, cellSize, 0, cellSize)}
		>
			<Frame
				size={new UDim2(0.7, 0, 0.7, 0)}
				backgroundTransparency={1}
				position={new UDim2(0.5, 0, 0.5, 0)}
				anchorPoint={new Vector2(0.5, 0.5)}
			>
				<SkinThumbnail active={false} skin={skin} transparency={transparency} />
			</Frame>
		</ShopItem>
	);
}

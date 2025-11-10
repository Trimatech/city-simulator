import React from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { useRem, useStore } from "client/hooks";
import { selectMenuCurrentSkin } from "client/store/menu";
import { GridScrolling } from "client/ui/layout/GridScrolling";
import { USER_NAME } from "shared/constants/core";
import { allWallSkins } from "shared/constants/skins";
import { RANDOM_SKIN, selectCurrentPlayerSkin, selectPlayerSkins } from "shared/store/saves";

import { SkinButton } from "./SkinButton";

const SKIN_LIST = [RANDOM_SKIN, ...allWallSkins.map((skin) => skin.id)];

export function SkinsList() {
	const rem = useRem();
	const store = useStore();

	const skinInventory = useSelectorCreator(selectPlayerSkins, USER_NAME) || [];
	const equippedSkin = useSelectorCreator(selectCurrentPlayerSkin, USER_NAME) ?? RANDOM_SKIN;
	const currentSkin = useSelector(selectMenuCurrentSkin);

	const cellSize = rem(15);

	return (
		<GridScrolling name="SkinsList" padding={rem(2)} spacing={rem(2)} cellSize={cellSize}>
			{SKIN_LIST.map((skin, i) => {
				const isActive = skin === currentSkin;
				const indexForButton = isActive ? 0 : 1;

				return (
					<SkinButton
						key={skin}
						id={skin}
						index={indexForButton}
						active={isActive}
						shuffle={skin === RANDOM_SKIN ? skinInventory : undefined}
						cellSize={cellSize}
						onClick={() => {
							store.setMenuSkin(skin);
						}}
					/>
				);
			})}
		</GridScrolling>
	);
}

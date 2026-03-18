import React from "@rbxts/react";
import { GridScrolling } from "client/ui/layout/GridScrolling";
import { useRem } from "client/ui/rem/useRem";
import { allWallSkins } from "shared/constants/skins";
import { RANDOM_SKIN } from "shared/store/saves";

import { SkinButton } from "./SkinButton";

const SKIN_LIST = [RANDOM_SKIN, ...allWallSkins.map((skin) => skin.id)];

export function SkinsList() {
	const rem = useRem();

	const cellSize = rem(14);
	const cellHeight = cellSize + rem(4.5);

	return (
		<GridScrolling name="SkinsList" padding={rem(2)} spacing={rem(2)} cellSize={cellSize} cellHeight={cellHeight}>
			{SKIN_LIST.map((skin) => {
				return <SkinButton key={skin} id={skin} />;
			})}
		</GridScrolling>
	);
}

import React, { memo, useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { selectCandiesInCell } from "shared/store/candy-grid/candy-grid-selectors";
import { CandyEntity } from "shared/store/candy-grid/candy-types";

import { Candy } from "./Candy";

interface CellCandiesProps {
	cellKey: string;
}

function CellCandiesComponent({ cellKey }: CellCandiesProps) {
	const cell = useSelectorCreator(selectCandiesInCell, cellKey);

	const items = useMemo(() => {
		if (!cell) return undefined;

		const nextP = new Array<CandyEntity>();

		for (const [, candy] of pairs(cell)) {
			if (!candy) continue;
			nextP.push(candy);
		}
		return nextP;
	}, [cell]);

	if (!cell) {
		//print(`no cell found for cellKey ${cellKey}`);
		return undefined;
	}

	if (!items || items.size() === 0) return undefined;

	return items.map((candy) => (
		<Candy
			key={candy.id}
			name={`candy_${candy.id}`}
			position={candy.position}
			color={candy.color}
			size={candy.size}
			eatenAt={candy.eatenAt}
		/>
	));
}

export const CellCandies = memo(CellCandiesComponent);

import React, { memo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { selectCandiesInCell } from "shared/store/candy-grid/candy-grid-selectors";

import { Candy } from "./Candy";

interface CellCandiesProps {
	cellKey: string;
}

function CellCandiesComponent({ cellKey }: CellCandiesProps) {
	const items = useSelectorCreator(selectCandiesInCell, cellKey);

	print("items....", cellKey, items);

	if (!items || items.size() === 0) return undefined;

	return (
		<>
			{items.map((candy) => (
				<Candy
					key={candy.id}
					name={`candy_${candy.id}`}
					position={candy.position}
					color={candy.color}
					size={candy.size}
					eatenAt={candy.eatenAt}
				/>
			))}
		</>
	);
}

export const CellCandies = memo(CellCandiesComponent);

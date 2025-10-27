import React, { memo, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectGridCells } from "shared/store/grid/grid-selectors";
import { GridCellsByEdgeId } from "shared/store/grid/grid-types";

import { CellWalls } from "./CellWalls";

function GridWallsComponent() {
	const cells = useSelector(selectGridCells) as Record<string, GridCellsByEdgeId | undefined>;

	const cellKeys = useMemo(() => {
		const keys = new Array<string>();
		for (const [cellKey, _] of pairs(cells)) keys.push(cellKey as string);
		return keys;
	}, [cells]);

	return cellKeys.map((key) => <CellWalls key={key} cellKey={key} />);
}

export const GridWalls = memo(GridWallsComponent);

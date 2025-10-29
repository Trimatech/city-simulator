import React, { memo, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useGridPosition } from "client/hooks/use-grid-position";
import { selectGridResolution } from "shared/store/grid/grid-selectors";
import { getCellKeyFromCoord } from "shared/utils/cell-key";

import { CellWalls } from "./CellWalls";

const VISIBLE_RADIUS_STUDS = 300;

function GridWallsComponent() {
	const resolution = useSelector(selectGridResolution);
	const gridPosition = useGridPosition();

	const relativeTemplate = useMemo(() => {
		if (resolution <= 0) return [] as Vector2[];
		const cellRadius = math.ceil(VISIBLE_RADIUS_STUDS / resolution);
		const offsets = new Array<Vector2>();
		for (const dx of $range(-cellRadius, cellRadius)) {
			for (const dy of $range(-cellRadius, cellRadius)) {
				offsets.push(new Vector2(dx, dy));
			}
		}
		return offsets;
	}, [resolution]);

	if (gridPosition === undefined || resolution <= 0) return undefined;

	return relativeTemplate.map((offset) => {
		const cx = gridPosition.X + offset.X;
		const cy = gridPosition.Y + offset.Y;
		const cellKey = getCellKeyFromCoord(new Vector2(cx, cy));

		return <CellWalls key={cellKey} cellKey={cellKey} />;
	});
}

export const GridWalls = memo(GridWallsComponent);

import React, { memo, useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useGridPosition } from "client/hooks/use-grid-position";
import { selectCandyGridResolution } from "shared/store/candy-grid/candy-grid-selectors";
import { getCellKeyFromCoord } from "shared/utils/cell-key";

import { DelayedCellCandies } from "./DelayedCellCandies";

const VISIBLE_RADIUS_STUDS = 300;

function CandiesComponent() {
	const resolution = useSelector(selectCandyGridResolution);
	const gridPosition = useGridPosition(selectCandyGridResolution);

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

		return <DelayedCellCandies key={cellKey} cellKey={cellKey} />;
	});
}

export const Candies = memo(CandiesComponent);

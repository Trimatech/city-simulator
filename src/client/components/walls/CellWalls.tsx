import React, { memo, useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { selectGridCell } from "shared/store/grid/grid-selectors";
import { GridLine } from "shared/store/grid/grid-types";

import { WallWithKey } from "./WallWithKey";

interface CellWallsProps {
	cellKey: string;
}

type GridLineWithKey = GridLine & { edgeId: string };

function CellWallsComponent({ cellKey }: CellWallsProps) {
	const cell = useSelectorCreator(selectGridCell, cellKey);

	const items = useMemo(() => {
		if (!cell) return [];
		const nextP = new Array<GridLineWithKey>();

		for (const [edgeId, line] of pairs(cell)) {
			if (!line) continue;
			nextP.push({ edgeId: edgeId as string, a: line.a, b: line.b, kind: line.kind, ownerId: line.ownerId });
		}
		return nextP;
	}, [cell]);

	if (!cell) return undefined;

	print(`rendering cell walls ${cellKey} ${items.size()}`);

	return (
		<>
			{items.map((it) => (
				<WallWithKey key={it.edgeId} cellKey={cellKey} edgeId={it.edgeId} />
			))}
		</>
	);
}

export const CellWalls = memo(CellWallsComponent);

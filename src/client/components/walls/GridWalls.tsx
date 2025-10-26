import React, { memo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { TRACER_PIECE_HEIGHT, WALL_HEIGHT } from "shared/constants/core";
import { GridLine, selectGridCells } from "shared/store/grid/grid-slice";

import { Wall } from "./Wall";

export function GridWalls() {
	const cells = useSelector(selectGridCells) as Record<string, Record<string, GridLine | undefined> | undefined>;
	const items = new Array<{ key: string; a: Vector2; b: Vector2; kind: "tracer" | "area"; ownerId: string }>();
	for (const [cellKey, cell] of pairs(cells)) {
		if (!cell) continue;
		const typed = cell as Record<string, GridLine | undefined>;
		for (const [edgeId, line] of pairs(typed)) {
			if (!line) continue;
			items.push({ key: `${cellKey}:${edgeId}`, a: line.a, b: line.b, kind: line.kind, ownerId: line.ownerId });
		}
	}

	return (
		<>
			{items.map((it) => (
				<Wall
					key={it.key}
					folderName={it.kind === "tracer" ? "tracer" : "outerWall"}
					startPoint={it.a}
					endPoint={it.b}
					height={it.kind === "tracer" ? TRACER_PIECE_HEIGHT : WALL_HEIGHT}
				/>
			))}
		</>
	);
}

export const MemoGridWalls = memo(GridWalls);

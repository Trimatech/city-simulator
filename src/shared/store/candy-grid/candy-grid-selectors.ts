import Object from "@rbxts/object-utils";
import { createSelector } from "@rbxts/reflex";

import { CandyGridState } from "./candy-grid-types";
import { CandyEntity, CandyType } from "./candy-types";

const emptyItems: readonly CandyEntity[] = [];

export const selectCandyGridResolution = (state: { candyGrid: CandyGridState }) => state.candyGrid.resolution;
export const selectCandyGridCells = (state: { candyGrid: CandyGridState }) => state.candyGrid.cells;
export const selectCandyGridCell = (cellKey: string) => (state: { candyGrid: CandyGridState }) => state.candyGrid.cells[cellKey];

export const selectCandiesInCell = (cellKey: string) =>
	createSelector(selectCandyGridCell(cellKey), (cell) => {
		if (!cell) return emptyItems;
		const vals = Object.values(cell) as (CandyEntity | undefined)[];
		const out = new Array<CandyEntity>();
		for (const v of vals) if (v) out.push(v);
		return out as readonly CandyEntity[];
	});

export const selectCandyGridCount = (filter?: CandyType) =>
	createSelector(selectCandyGridCells, (cells) => {
		let size = 0;
		for (const [, cell] of pairs(cells)) {
			if (!cell) continue;
			for (const [, candy] of pairs(cell)) {
				if (!candy) continue;
				if (filter !== undefined && candy.type !== filter) continue;
				if (candy.eatenAt) continue;
				size += 1;
			}
		}
		return size;
	});

export const selectAllCandies = createSelector(selectCandyGridCells, (cells) => {
	const items: CandyEntity[] = [];
	for (const [, cell] of pairs(cells)) {
		if (!cell) continue;
		for (const [, candy] of pairs(cell)) {
			if (candy) items.push(candy);
		}
	}
	return items as readonly CandyEntity[];
});



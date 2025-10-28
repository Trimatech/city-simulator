import { createProducer } from "@rbxts/reflex";
import { getEdgeId } from "shared/utils/edge-id";

import { GridCellsByEdgeId, GridState } from "./grid-types";

export function shallowEqualCell(a?: GridCellsByEdgeId, b?: GridCellsByEdgeId) {
	if (a === b) return true;
	if (!a || !b) return false;
	let countA = 0;
	for (const [id, line] of pairs(a)) {
		countA++;
		const other = b[id as string];
		if (!other) return false;
		if (other.kind !== line!.kind || other.ownerId !== line!.ownerId) return false;
		// compare geometry with IDs stability
		const idA = getEdgeId({ a: line!.a, b: line!.b });
		const idB = getEdgeId({ a: other.a, b: other.b });
		if (idA !== idB) return false;
	}
	let countB = 0;
	for (const [,] of pairs(b)) countB++;
	return countA === countB;
}

const defaultState: GridState = {
	resolution: 20,
	cells: {},
};

export const gridSlice = createProducer(defaultState, {
	setCellLines: (state, cellKey: string, lines: GridCellsByEdgeId) => {
		return {
			...state,
			cells: {
				...state.cells,
				[cellKey]: lines,
			},
		};
	},

	clearGrid: (state) => ({ ...state, cells: {} }),
});

import { createProducer } from "@rbxts/reflex";

import { GridCellsByEdgeId, GridState } from "./grid-types";

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

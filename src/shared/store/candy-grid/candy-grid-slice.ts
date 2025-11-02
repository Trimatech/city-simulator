import { createProducer } from "@rbxts/reflex";

import { CandyGridCell, CandyGridState } from "./candy-grid-types";

const defaultState: CandyGridState = {
	resolution: 20,
	cells: {},
};

export const candyGridSlice = createProducer(defaultState, {
	setCandyGridResolution: (state, resolution: number) => ({ ...state, resolution }),
	setCandyCell: (state, cellKey: string, cell: CandyGridCell) => ({
		...state,
		cells: {
			...state.cells,
			[cellKey]: cell,
		},
	}),
	clearCandyGrid: (state) => ({ ...state, cells: {} }),
});

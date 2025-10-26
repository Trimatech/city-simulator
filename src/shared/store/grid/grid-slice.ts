import { createProducer } from "@rbxts/reflex";
import { getEdgeId } from "shared/utils/edge-id";

export interface GridLine {
	readonly a: Vector2;
	readonly b: Vector2;
	readonly ownerId: string;
	readonly kind: "tracer" | "area";
}

export interface GridCellsByEdgeId {
	readonly [edgeId: string]: GridLine | undefined;
}

export interface GridState {
	readonly resolution: number;
	readonly cells: { readonly [cellKey: string]: GridCellsByEdgeId | undefined };
}

const defaultState: GridState = {
	resolution: 10,
	cells: {},
};

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

export const selectGrid = (state: { grid: GridState }) => state.grid;
export const selectGridResolution = (state: { grid: GridState }) => state.grid.resolution;
export const selectGridCells = (state: { grid: GridState }) => state.grid.cells;

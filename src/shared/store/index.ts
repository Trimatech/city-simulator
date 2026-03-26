import { CombineStates } from "@rbxts/reflex";

import { candyGridSlice } from "./candy-grid/candy-grid-slice";
import { gridSlice } from "./grid/grid-slice";
import { milestoneSlice } from "./milestones";
import { saveSlice } from "./saves";
import { soldiersSlice } from "./soldiers";
import { towerSlice } from "./towers/tower-slice";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
	soldiers: soldiersSlice,
	saves: saveSlice,
	towers: towerSlice,
	grid: gridSlice,
	candyGrid: candyGridSlice,
	milestones: milestoneSlice,
};

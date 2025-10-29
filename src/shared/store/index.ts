import { CombineStates } from "@rbxts/reflex";

import { candySlice } from "./candy";
import { gridSlice } from "./grid/grid-slice";
import { saveSlice } from "./saves";
import { soldiersSlice } from "./soldiers";
import { towerSlice } from "./towers/tower-slice";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
	candy: candySlice,
	soldiers: soldiersSlice,
	saves: saveSlice,
	towers: towerSlice,
	grid: gridSlice,
};

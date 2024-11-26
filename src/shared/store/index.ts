import { CombineStates } from "@rbxts/reflex";

import { candySlice } from "./candy";
import { saveSlice } from "./saves";
import { soldiersSlice } from "./soldiers";
import { towerSlice } from "./towers/tower-slice";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
	candy: candySlice,
	soldiers: soldiersSlice,
	saves: saveSlice,
	towers: towerSlice,
};

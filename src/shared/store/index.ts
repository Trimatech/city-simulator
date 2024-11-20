import { CombineStates } from "@rbxts/reflex";

import { candySlice } from "./candy";
import { saveSlice } from "./saves";
import { soldiersSlice } from "./soldiers";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
	candy: candySlice,
	soldiers: soldiersSlice,
	saves: saveSlice,
};

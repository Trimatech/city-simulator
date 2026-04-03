import { CombineStates } from "@rbxts/reflex";

import { budgetSlice } from "./budget-slice";
import { simulationSlice } from "./simulation-slice";

export type SharedState = CombineStates<typeof slices>;

export const slices = {
	budget: budgetSlice,
	simulation: simulationSlice,
};

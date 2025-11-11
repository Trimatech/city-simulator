import { combineProducers, InferState } from "@rbxts/reflex";
import { slices } from "shared/store";

import { alertSlice } from "./alert";
import { receiverMiddleware } from "./middleware/receiver";
import { settingsSlice } from "./settings/settingsSlice";
import { worldSlice } from "./world";

export type RootStore = typeof store;

export type RootState = InferState<RootStore>;

export function createStore() {
	const store = combineProducers({
		...slices,
		alert: alertSlice,
		settings: settingsSlice,
		world: worldSlice,
	});

	store.applyMiddleware(receiverMiddleware());

	return store;
}

export const store = createStore();

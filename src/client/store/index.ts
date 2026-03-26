import { combineProducers, InferState } from "@rbxts/reflex";
import { alertSlice } from "@rbxts-ui/alerts";
import { slices } from "shared/store";

import { receiverMiddleware } from "./middleware/receiver";
import { screenSlice } from "./screen";
import { settingsSlice } from "./settings/settingsSlice";
import { worldSlice } from "./world";

export type RootStore = typeof store;

export type RootState = InferState<RootStore>;

export function createStore() {
	const store = combineProducers({
		...slices,
		alert: alertSlice,
		screen: screenSlice,
		settings: settingsSlice,
		world: worldSlice,
	});

	store.applyMiddleware(receiverMiddleware());

	return store;
}

export const store = createStore();

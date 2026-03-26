import { createProducer } from "@rbxts/reflex";

export const enum MenuWindow {
	Shop = "shop",
	DailyReward = "dailyReward",
	Progress = "progress",
}

export interface ScreenState {
	readonly cachedDeadline: number | undefined;
	readonly openMenuWindow: MenuWindow | undefined;
}

const initialState: ScreenState = {
	cachedDeadline: undefined,
	openMenuWindow: undefined,
};

export const screenSlice = createProducer(initialState, {
	setCachedDeadline: (state, cachedDeadline: number | undefined) => ({
		...state,
		cachedDeadline,
	}),

	setOpenMenuWindow: (state, openMenuWindow: MenuWindow | undefined) => ({
		...state,
		openMenuWindow,
	}),
});

import { createProducer } from "@rbxts/reflex";

export const enum MenuWindow {
	Shop = "shop",
	DailyReward = "dailyReward",
	Progress = "progress",
}

export interface WinData {
	readonly winnerId: string;
	readonly winnerName: string;
	readonly winnerUserId: number;
	readonly areaPercent: number;
	readonly eliminations: number;
	readonly moneyEarned: number;
	readonly crystalsEarned: number;
	readonly deadline: number;
}

export interface ScreenState {
	readonly cachedDeadline: number | undefined;
	readonly openMenuWindow: MenuWindow | undefined;
	readonly winData: WinData | undefined;
}

const initialState: ScreenState = {
	cachedDeadline: undefined,
	openMenuWindow: undefined,
	winData: undefined,
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

	setWinData: (state, winData: WinData | undefined) => ({
		...state,
		winData,
	}),
});

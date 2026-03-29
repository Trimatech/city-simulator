import { RootState } from "client/store";

export const selectCachedDeadline = (state: RootState) => state.screen.cachedDeadline;

export const selectOpenMenuWindow = (state: RootState) => state.screen.openMenuWindow;

export const selectWinData = (state: RootState) => state.screen.winData;

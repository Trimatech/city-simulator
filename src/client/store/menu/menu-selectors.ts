import { RootState } from "..";

export const selectMusicEnabled = (state: RootState) => {
	return state.menu.music;
};

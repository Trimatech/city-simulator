import { RootState } from "..";

export const selectMusicEnabled = (state: RootState) => {
	return state.settings.music;
};

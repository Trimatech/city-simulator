import { RootState } from "..";

export const selectMenuCurrentSkin = (state: RootState) => {
	return state.menu.skins.current;
};

export const selectMusicEnabled = (state: RootState) => {
	return state.menu.music;
};

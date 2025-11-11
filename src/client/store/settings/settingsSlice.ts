import { createProducer } from "@rbxts/reflex";

export interface SettingsState {
	readonly music: boolean;
}

const initialState: SettingsState = {
	music: true,
};

export const settingsSlice = createProducer(initialState, {
	setMenuMusic: (state, music: boolean) => ({
		...state,
		music,
	}),
});

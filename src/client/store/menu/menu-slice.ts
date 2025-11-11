import { createProducer } from "@rbxts/reflex";

export interface MenuState {
	readonly music: boolean;
}

const initialState: MenuState = {
	music: true,
};

export const menuSlice = createProducer(initialState, {
	setMenuMusic: (state, music: boolean) => ({
		...state,
		music,
	}),
});

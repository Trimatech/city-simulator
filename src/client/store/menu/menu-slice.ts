import { createProducer } from "@rbxts/reflex";
import { RANDOM_SKIN } from "shared/store/saves";

export interface MenuState {
	readonly music: boolean;

	readonly skins: {
		readonly current: string;
	};
}

const initialState: MenuState = {
	music: true,
	skins: {
		current: RANDOM_SKIN,
	},
};

export const menuSlice = createProducer(initialState, {
	setMenuSkin: (state, skin: string) => ({
		...state,
		skins: {
			...state.skins,
			current: skin,
		},
	}),

	setMenuMusic: (state, music: boolean) => ({
		...state,
		music,
	}),
});

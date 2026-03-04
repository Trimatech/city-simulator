import { throttle } from "@rbxts/set-timeout";

import assets from "shared/assets";

import { playSound } from "./play-sound";

export type ButtonSoundVariant = "default" | "alt" | "none";

const BUTTON_DELAY = 0.1;

let lastPressed: number | undefined;

export const playButtonDown = throttle((variant: ButtonSoundVariant = "default") => {
	if (variant === "none" || (lastPressed !== undefined && os.clock() - lastPressed < 2 * BUTTON_DELAY)) {
		return;
	}

	lastPressed = os.clock();

	return playSound(variant === "default" ? assets.sounds.button_down : assets.sounds.button_down_alt, {
		volume: 0.25,
	});
}, 2 * BUTTON_DELAY);

export async function playButtonUp(variant: ButtonSoundVariant = "default") {
	if (variant === "none" || lastPressed === undefined) {
		return;
	}

	const difference = os.clock() - lastPressed;

	lastPressed = undefined;

	if (difference < BUTTON_DELAY) {
		task.wait(BUTTON_DELAY - difference);
	}

	return playSound(variant === "default" ? assets.sounds.button_up : assets.sounds.button_up_alt, {
		volume: 0.25,
	});
}

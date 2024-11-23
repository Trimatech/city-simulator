import { useDebounceEffect, usePrevious } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { selectSoldierFromWorldSubject } from "client/store/world";
import { playSound, sounds } from "shared/assets";
import { selectHasLocalSoldier, selectSoldierIsBoosting } from "shared/store/soldiers";

const ERROR_SOUNDS = [sounds.error_1, sounds.error_2, sounds.error_3];

const random = new Random();

export function WorldSounds() {
	const soldier = useSelector(selectSoldierFromWorldSubject);
	const boosting = useSelectorCreator(selectSoldierIsBoosting, soldier?.id ?? "");
	const hasLocalSoldier = useSelector(selectHasLocalSoldier);
	const previousScore = usePrevious(soldier?.orbs);

	const volume = hasLocalSoldier ? 0.5 : 0.25;

	// Death sound
	useEffect(() => {
		if (soldier?.dead) {
			const index = random.NextInteger(0, ERROR_SOUNDS.size() - 1);
			playSound(ERROR_SOUNDS[index], { volume: 2 * volume });
		}
	}, [soldier?.dead]);

	// Spawn sound
	useEffect(() => {
		if (hasLocalSoldier) {
			playSound(sounds.start_game);
		}
	}, [hasLocalSoldier]);

	// Candy eat sound
	useEffect(() => {
		if ((soldier?.orbs ?? 0) > (previousScore ?? 0)) {
			const speed = random.NextNumber(0.87, 1);
			playSound(sounds.whoosh, { volume: 0.6 * volume, speed });
		}
	}, [soldier?.orbs]);

	// Boost sound
	useDebounceEffect(
		() => {
			if (soldier) {
				playSound(boosting ? sounds.boost_start : sounds.boost_stop, { volume });
			}
		},
		[boosting],
		{ wait: 0.25, leading: true },
	);

	return <></>;
}

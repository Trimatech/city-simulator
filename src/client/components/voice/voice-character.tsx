import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useRef } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { selectSoldierById } from "shared/store/soldiers";
import { Character } from "shared/utils/player-utils";

interface VoiceCharacterProps {
	readonly player: Player;
	readonly model: Character;
}

export function VoiceCharacter({ player, model }: VoiceCharacterProps) {
	const soldier = useSelectorCreator(selectSoldierById, player.Name);
	const hidden = useRef<Model>();

	useInterval(() => {
		if (soldier) {
			//	model.PivotTo(toRealSpace(soldier.head));
		} else if (hidden.current !== model) {
			model.PivotTo(new CFrame(100, 200, 100));
			hidden.current = model;
		}
	}, 0.2);

	return <></>;
}

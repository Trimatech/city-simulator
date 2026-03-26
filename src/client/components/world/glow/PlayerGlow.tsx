import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { getPlayerByName } from "shared/utils/player-utils";

import { NAME_DISPLAY_DISTANCE } from "./label-constants";
import { SoldierGlow } from "./SoldierGlow";

interface PlayerGlowProps {
	readonly id: string;
}

function setNameDisplayDistance(character: Model | undefined) {
	if (!character) return;
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		humanoid.NameDisplayDistance = NAME_DISPLAY_DISTANCE;
	}
}

export function PlayerGlow({ id }: PlayerGlowProps) {
	const player = getPlayerByName(id);
	const [character, setCharacter] = useState<Model | undefined>(player?.Character as Model | undefined);

	useEventListener(player?.CharacterAdded, (char) => {
		setNameDisplayDistance(char);
		setCharacter(char);
	});

	useEventListener(player?.CharacterRemoving, () => {
		setCharacter(undefined);
	});

	useEffect(() => {
		setNameDisplayDistance(character);
	}, [character]);

	return <SoldierGlow id={id} model={character} />;
}

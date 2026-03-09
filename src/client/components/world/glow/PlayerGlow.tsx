import React, { useState } from "@rbxts/react";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { getPlayerByName } from "shared/utils/player-utils";

import { SoldierGlow } from "./SoldierGlow";

interface PlayerGlowProps {
	readonly id: string;
}

export function PlayerGlow({ id }: PlayerGlowProps) {
	const player = getPlayerByName(id);
	const [character, setCharacter] = useState<Model | undefined>(player?.Character as Model | undefined);

	useEventListener(player?.CharacterAdded, (char) => {
		setCharacter(char);
	});

	useEventListener(player?.CharacterRemoving, () => {
		setCharacter(undefined);
	});

	return <SoldierGlow id={id} model={character} />;
}

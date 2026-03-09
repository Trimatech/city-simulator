import Object from "@rbxts/object-utils";
import React, { useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldiersById } from "shared/store/soldiers";

import { PlayerGlow } from "./PlayerGlow";

export function PlayerGlows() {
	const soldiersById = useSelector(selectSoldiersById);

	const playerIds = useMemo(() => {
		const ids: string[] = [];
		for (const rawId of Object.keys(soldiersById as unknown as { [id: string]: unknown })) {
			const id = tostring(rawId);
			if (string.sub(id, 1, 4) !== "BOT_" && soldiersById[id] && !soldiersById[id]!.dead) {
				ids.push(id);
			}
		}
		return ids;
	}, [soldiersById]);

	return (
		<>
			{playerIds.map((id) => (
				<PlayerGlow key={id} id={id} />
			))}
		</>
	);
}

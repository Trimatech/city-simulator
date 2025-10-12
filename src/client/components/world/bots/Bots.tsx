import Object from "@rbxts/object-utils";
import React, { useMemo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldiersById } from "shared/store/soldiers";

import { Bot } from "./Bot";

export function Bots() {
	const soldiersById = useSelector(selectSoldiersById);
	const botIds = useMemo(() => {
		const ids: string[] = [];
		for (const rawId of Object.keys(soldiersById as unknown as { [id: string]: unknown })) {
			const id = tostring(rawId);
			if (string.sub(id, 1, 4) === "BOT_" && soldiersById[id] && !soldiersById[id]!.dead) ids.push(id);
		}
		return ids;
	}, [soldiersById]);

	return (
		<>
			{botIds.map((id) => {
				const soldier = soldiersById[id]!;
				return <Bot key={id} id={id} soldier={soldier} />;
			})}
		</>
	);
}

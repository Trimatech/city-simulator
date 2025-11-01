import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Group } from "client/ui/layout/group";
import { selectSoldierIds } from "shared/store/soldiers";

import { Soldier } from "./soldier";

export function Soldiers() {
	const soldierIds = useSelector(selectSoldierIds);

	return (
		<Group name="Soldiers" zIndex={2}>
			{soldierIds.map((id) => (
				<Soldier key={id} id={id} />
			))}
		</Group>
	);
}

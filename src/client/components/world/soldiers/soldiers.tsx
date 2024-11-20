import Object from "@rbxts/object-utils";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Group } from "client/components/ui/group";
import { selectSoldiersById } from "shared/store/soldiers";

import { Soldier } from "./soldier";

export function Soldiers() {
	const soldiers = useSelector(selectSoldiersById);

	return (
		<Group zIndex={2}>
			{Object.values(soldiers).map((soldier) => {
				return <Soldier key={soldier.id} soldier={soldier} />;
			})}
		</Group>
	);
}

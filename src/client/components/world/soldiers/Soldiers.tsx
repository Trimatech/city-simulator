import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldierIds } from "shared/store/soldiers";

import { Soldier } from "./Soldier";

export function Soldiers() {
	const soldierIds = useSelector(selectSoldierIds);

	return soldierIds.map((id) => <Soldier key={id} id={id} />);
}

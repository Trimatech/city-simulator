import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players } from "@rbxts/services";
import { TracerLastWall } from "client/components/walls/TracerLastWall";
import { selectSoldierIsDead, selectSoldierIsInside } from "shared/store/soldiers";

interface Props {
	id: string;
}

export function Soldier({ id }: Props) {
	const isDead = useSelector(selectSoldierIsDead(id));

	const isInside = useSelector(selectSoldierIsInside(id));

	const localPlayer = Players.LocalPlayer;
	const character = localPlayer?.Character;

	const isClient = localPlayer?.Name === id;

	const showTracerLastWall = isClient && character && !isDead && !isInside;

	return showTracerLastWall && <TracerLastWall soldierId={id} />;
}

import React from "@rbxts/react";
import { Players } from "@rbxts/services";
import { TracerLastWall } from "client/components/walls/TracerLastWall";
import { palette } from "shared/constants/palette";
import { SoldierEntity } from "shared/store/soldiers/soldier-slice";

interface Props {
	soldier: SoldierEntity;
	color?: Color3;
	transparency?: number;
}

export function Soldier({ soldier, color: _color = palette.white, transparency: _transparency = 0 }: Props) {
	const isDead = soldier.dead;
	const localPlayer = Players.LocalPlayer;
	const character = localPlayer?.Character;

	const isClient = localPlayer?.Name === soldier.name;

	// Get the last tracer point
	const lastTracerPoint = soldier.tracers[soldier.tracers.size() - 1];

	return (
		<>
			{/* Tracer lines */}
			{/* <TracerWalls tracers={soldier.tracers as Vector2[]} skinId={soldier.skin} outline={soldier.shieldActive} /> */}

			{/* Home polygon removed: now rendered via grid lines */}

			{/* player connection line - hide if dead */}
			{isClient && character && lastTracerPoint && !isDead && (
				<TracerLastWall lastTracerPoint={lastTracerPoint} skinId={soldier.skin} />
			)}
		</>
	);
}

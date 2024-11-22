import React from "@rbxts/react";
import { Players } from "@rbxts/services";
import { AreaWalls } from "client/components/walls/AreaWalls";
import { TracerWalls } from "client/components/walls/TracerWalls";
import { palette } from "shared/constants/palette";
import { SoldierEntity } from "shared/store/soldiers/soldier-slice";

interface Props {
	soldier: SoldierEntity;
	color?: Color3;
	transparency?: number;
}

export function Soldier({ soldier, color = palette.white, transparency = 0 }: Props) {
	const isDead = soldier.dead;
	const localPlayer = Players.LocalPlayer;
	const character = localPlayer.Character;

	const isClient = localPlayer.Name === soldier.name;

	// Get the last tracer point
	//const lastTracerPoint = position[position.size() - 1];

	return (
		<>
			{/* Tracer lines */}
			<TracerWalls tracers={soldier.tracers as Vector2[]} skinId={soldier.skin} />

			{/* Home polygon */}
			<AreaWalls
				points={soldier.polygon as Vector2[]}
				isCrumbling={isDead}
				color={color}
				transparency={transparency}
				skinId={soldier.skin}
			/>

			{/* player connection line - hide if dead */}
			{/* {isClient && character && lastTracerPoint && !isDead && (
				<Wall
					key="player-connection-line"
					startPoint={[lastTracerPoint.X, lastTracerPoint.Y]}
					endPoint={[character.GetPivot().Position.X, character.GetPivot().Position.Z]}
					color={lastTracerColor}
					transparency={lastTracerTransparency}
					position={position}
					skinId={soldier.skin}
				/>
			)} */}
		</>
	);
}

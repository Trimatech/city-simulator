import React from "@rbxts/react";
import { Players } from "@rbxts/services";
import { AreaWalls } from "client/components/walls/AreaWalls";
import { palette } from "shared/constants/palette";
import { Point } from "shared/polybool/polybool";
import { SoldierEntity } from "shared/store/soldiers/soldier-slice";

import { Wall } from "../../walls/Wall";

interface Props {
	soldier: SoldierEntity;
	color?: Color3;
	transparency?: number;
	thickness?: number;
	height?: number;
	position?: Vector3;
	showTracers?: boolean;
	tracerColor?: Color3;
	tracerTransparency?: number;
	lastTracerColor?: Color3;
	lastTracerTransparency?: number;
	isDead?: boolean;
}

export function Soldier({
	soldier,
	color = palette.white,
	transparency = 0,
	position = new Vector3(),
	tracerColor = palette.blue,
	tracerTransparency = 0,
	lastTracerColor = palette.red,
	lastTracerTransparency = 0.5,
}: Props) {
	const isDead = soldier.dead;
	const segments = soldier.tracers;
	const localPlayer = Players.LocalPlayer;
	const character = localPlayer.Character;

	const isClient = localPlayer.Name === soldier.name;

	// Convert segments to array of line segments
	const tracerLines = segments
		.mapFiltered((segment, index) => {
			if (index === segments.size() - 1) return undefined; // Skip last point
			const currentPoint: Point = [segment.X, segment.Y];
			const nextPoint: Point = [segments[index + 1].X, segments[index + 1].Y];
			return [currentPoint, nextPoint] as [Point, Point];
		})
		.filter((line) => line !== undefined);

	// Get the last tracer point
	const lastTracerPoint = segments[segments.size() - 1];

	return (
		<>
			{/* Tracer lines */}
			{tracerLines.map((line, index) => (
				<Wall
					key={`soldier-segment-${index}`}
					startPoint={line[0]}
					endPoint={line[1]}
					color={tracerColor}
					transparency={tracerTransparency}
					position={position}
					isCrumbling={isDead}
				/>
			))}

			{/* Home polygon */}
			<AreaWalls
				points={soldier.polygon as Vector2[]}
				isCrumbling={isDead}
				color={color}
				transparency={transparency}
			/>

			{/* player connection line - hide if dead */}
			{isClient && character && lastTracerPoint && !isDead && (
				<Wall
					key="player-connection-line"
					startPoint={[lastTracerPoint.X, lastTracerPoint.Y]}
					endPoint={[character.GetPivot().Position.X, character.GetPivot().Position.Z]}
					color={lastTracerColor}
					transparency={lastTracerTransparency}
					position={position}
				/>
			)}
		</>
	);
}

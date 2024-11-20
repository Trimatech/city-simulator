import React from "@rbxts/react";
import { Players } from "@rbxts/services";
import { Walls } from "client/components/walls/Walls";
import { palette } from "shared/constants/palette";
import { Line, Point } from "shared/polybool/polybool";
import { SnakeEntity } from "shared/store/snakes/snake-slice";

import { Wall } from "../../walls/Wall";

interface Props {
	snake: SnakeEntity;
	color?: Color3;
	transparency?: number;
	thickness?: number;
	height?: number;
	position?: Vector3;
	showTracers?: boolean;
	tracerColor?: Color3;
	tracerTransparency?: number;
}

export function Snake({
	snake,
	color = palette.blue,
	transparency = 0.2,
	position = new Vector3(),
	tracerColor = palette.red,
	tracerTransparency = 0.5,
}: Props) {
	const segments = snake.tracers;
	const localPlayer = Players.LocalPlayer;
	const character = localPlayer.Character;

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
			{/* Main snake body */}
			{tracerLines.map((line, index) => (
				<Wall
					key={`snake-segment-${index}`}
					line={line as Line}
					color={color}
					transparency={transparency}
					position={position}
				/>
			))}

			<Walls points={snake.polygon as Vector2[]} />

			{/* Line from last tracer to player position */}
			{character && lastTracerPoint && (
				<Wall
					key="player-connection-line"
					line={[
						[lastTracerPoint.X, lastTracerPoint.Y],
						[character.GetPivot().Position.X, character.GetPivot().Position.Z],
					]}
					color={tracerColor}
					transparency={tracerTransparency}
					position={position}
				/>
			)}
		</>
	);
}

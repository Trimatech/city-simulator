import React from "@rbxts/react";
import { Walls } from "client/components/walls/Walls";
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

export function Snake({ snake, color = new Color3(1, 1, 1), transparency = 0, position = new Vector3() }: Props) {
	const segments = snake.tracers;

	// Convert segments to array of line segments
	const tracerLines = segments
		.mapFiltered((segment, index) => {
			if (index === segments.size() - 1) return undefined; // Skip last point
			const currentPoint: Point = [segment.X, segment.Y];
			const nextPoint: Point = [segments[index + 1].X, segments[index + 1].Y];
			return [currentPoint, nextPoint] as [Point, Point];
		})
		.filter((line) => line !== undefined);

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

			{/* Tracers for input visualization */}
			{/* {showTracers && snake.position && (
				<Wall
					key="snake-input-tracer"
					line={[
						[segments[0].X, segments[0].Y],
						[segments[0].X + snake.position.X * 5, segments[0].Y + snake.position.Y * 5],
					]}
					height={height}
					thickness={thickness * 0.5}
					color={tracerColor}
					transparency={tracerTransparency}
					position={position}
				/>
			)} */}
		</>
	);
}

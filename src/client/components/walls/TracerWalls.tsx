import React, { memo } from "@rbxts/react";
import { Point } from "shared/polybool/polybool";

import { Wall } from "./Wall";

interface Props {
	skinId?: string;
	tracers: Vector2[];
	isCrumbling?: boolean;
}

function TracerWallsComponent({ tracers, skinId, isCrumbling = false }: Props) {
	warn("rendering tracer walls");
	// Convert segments to array of line segments
	const tracerLines = tracers
		.mapFiltered((segment, index) => {
			if (index === tracers.size() - 1) return undefined; // Skip last point
			const currentPoint: Point = [segment.X, segment.Y];
			const nextPoint: Point = [tracers[index + 1].X, tracers[index + 1].Y];
			return [currentPoint, nextPoint] as [Point, Point];
		})
		.filter((line) => line !== undefined);

	return (
		<>
			{tracerLines.map((line, index) => (
				<Wall
					key={`soldier-segment-${index}`}
					startPoint={line[0]}
					endPoint={line[1]}
					isCrumbling={isCrumbling}
					skinId={skinId}
					tracerIndex={index}
				/>
			))}
		</>
	);
}

export const TracerWalls = memo(TracerWallsComponent);

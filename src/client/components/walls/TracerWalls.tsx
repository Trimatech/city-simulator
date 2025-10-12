import React, { memo } from "@rbxts/react";
import { TRACER_PIECE_HEIGHT } from "shared/constants/core";

import { Wall } from "./Wall";

interface Props {
	skinId?: string;
	tracers: Vector2[];
	isCrumbling?: boolean;
	outline?: boolean;
}

function TracerWallsComponent({ tracers, skinId, isCrumbling = false, outline = false }: Props) {
	//	warn("rendering tracer walls");
	// Convert segments to array of line segments
	const tracerLines = tracers
		.mapFiltered((segment, index) => {
			if (index === tracers.size() - 1) return undefined; // Skip last point
			const currentPoint = segment;
			const nextPoint = tracers[index + 1];
			return [currentPoint, nextPoint];
		})
		.filter((line) => line !== undefined);

	return (
		<>
			{tracerLines.map((line, index) => (
				<Wall
					key={`soldier-segment-${index}`}
					folderName={`tracer`}
					startPoint={line[0]}
					endPoint={line[1]}
					isCrumbling={isCrumbling}
					skinId={skinId}
					tracerIndex={index}
					height={TRACER_PIECE_HEIGHT}
					outline={outline}
				/>
			))}
		</>
	);
}

export const TracerWalls = memo(TracerWallsComponent);

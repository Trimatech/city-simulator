import React from "@rbxts/react";
import { memo } from "@rbxts/react";

import { useCharacterPosition } from "../../hooks/use-character-position";
import { Wall } from "./Wall";

interface Props {
	lastTracerPoint: Vector2;
	skinId?: string;
}

function TracerLastWallComponent({ lastTracerPoint, skinId }: Props) {
	const characterPosition = useCharacterPosition();

	return (
		<Wall
			key="player-connection-line"
			name={`player-connection-line_${lastTracerPoint.X}_${lastTracerPoint.Y}`}
			startPoint={lastTracerPoint}
			endPoint={characterPosition.getValue()}
			skinId={skinId}
		/>
	);
}

export const TracerLastWall = memo(TracerLastWallComponent);

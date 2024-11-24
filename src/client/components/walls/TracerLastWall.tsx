import React from "@rbxts/react";
import { memo } from "@rbxts/react";
import { TRACER_PIECE_HEIGHT } from "shared/constants/core";

import { useCharacterPosition } from "../../hooks/use-character-position";
import { Wall } from "./Wall";

interface Props {
	lastTracerPoint: Vector2;
	skinId?: string;
}

function TracerLastWallComponent({ lastTracerPoint, skinId }: Props) {
	const characterPosition = useCharacterPosition();

	const characterPositionValue = characterPosition.getValue();
	if (!characterPositionValue) return undefined;

	return (
		<Wall
			key="player-connection-line"
			folderName={`tracer`}
			startPoint={lastTracerPoint}
			endPoint={characterPositionValue}
			skinId={skinId}
			height={TRACER_PIECE_HEIGHT}
		/>
	);
}

export const TracerLastWall = memo(TracerLastWallComponent);

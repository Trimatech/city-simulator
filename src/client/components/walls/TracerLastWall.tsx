import React, { memo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useDebouncedValue } from "client/hooks/use-debounced-value";
import { useCharacterPositionRounded } from "client/hooks/useCharacterPositionRounded";
import { TRACER_PIECE_HEIGHT } from "shared/constants/core";
import { selectSoldierLastTracerPoint, selectSoldierSkin } from "shared/store/soldiers";

import { Wall } from "./Wall";

interface Props {
	soldierId: string;
}

function TracerLastWallComponent({ soldierId }: Props) {
	const characterPosition = useCharacterPositionRounded();
	const skin = useSelector(selectSoldierSkin(soldierId));
	const lastTracerPoint = useSelector(selectSoldierLastTracerPoint(soldierId));

	const settledLastTracerPoint = useDebouncedValue(lastTracerPoint, { wait: 0.01 });

	if (!settledLastTracerPoint) return undefined;

	if (!characterPosition) return undefined;

	return (
		<Wall
			folderName={`tracer`}
			startPoint={settledLastTracerPoint}
			endPoint={characterPosition}
			skinId={skin}
			kind={"tracer"}
			height={TRACER_PIECE_HEIGHT}
		/>
	);
}

export const TracerLastWall = memo(TracerLastWallComponent);

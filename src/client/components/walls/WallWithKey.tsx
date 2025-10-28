import React, { memo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { TRACER_PIECE_HEIGHT, WALL_HEIGHT } from "shared/constants/core";
import { selectGridEdge } from "shared/store/grid/grid-selectors";
import { selectSoldierShieldActive, selectSoldierSkin } from "shared/store/soldiers";

import { Wall } from "./Wall";

function WallWithKeyComponent({ cellKey, edgeId }: { cellKey: string; edgeId: string }) {
	const edge = useSelectorCreator(selectGridEdge, cellKey, edgeId);
	const ownerId = edge?.ownerId ?? "__none__";
	const skinId = useSelectorCreator(selectSoldierSkin, ownerId);
	const shieldActive = useSelectorCreator(selectSoldierShieldActive, ownerId);

	//print(`wallWithKeyComponent ${cellKey} ${edgeId} ${ownerId} ${skinId} ${shieldActive}`);

	if (!edge) return undefined;

	// useEffect(() => {
	// 	print(`mounting wall with key ${edge.kind} ${cellKey}:${edgeId}`);
	// }, []);

	return (
		<Wall
			key={edgeId}
			folderName={edge.kind === "tracer" ? "tracer" : "outerWall"}
			startPoint={edge.a}
			endPoint={edge.b}
			height={edge.kind === "tracer" ? TRACER_PIECE_HEIGHT : WALL_HEIGHT}
			skinId={skinId}
			outline={shieldActive}
		/>
	);
}

export const WallWithKey = memo(WallWithKeyComponent);

import React, { memo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { TRACER_PIECE_HEIGHT, WALL_HEIGHT } from "shared/constants/core";
import { selectGridEdge } from "shared/store/grid/grid-selectors";
import { selectSoldierShieldActive, selectSoldierSkin, selectSoldierZIndex } from "shared/store/soldiers";

import { Wall } from "./Wall";

function WallWithKeyComponent({ cellKey, edgeId }: { cellKey: string; edgeId: string }) {
	const edge = useSelectorCreator(selectGridEdge, cellKey, edgeId);
	const ownerId = edge?.ownerId ?? "__none__";
	const skinId = useSelectorCreator(selectSoldierSkin, ownerId);
	const shieldActive = useSelectorCreator(selectSoldierShieldActive, ownerId);
	const zIndex = useSelectorCreator(selectSoldierZIndex, ownerId);

	//print(`wallWithKeyComponent ${cellKey} ${edgeId} ${ownerId} ${skinId} ${shieldActive}`);

	if (!edge) return undefined;

	// useEffect(() => {
	// 	print(`mounting wall with key ${edge.kind} ${cellKey}:${edgeId}`);
	// }, []);

	const height = edge.kind === "tracer" ? TRACER_PIECE_HEIGHT : edge.kind === "area2" ? WALL_HEIGHT + 1 : WALL_HEIGHT;
	const folderName = edge.kind === "tracer" ? "tracer" : "outerWall";
	return (
		<Wall
			key={edgeId}
			folderName={folderName}
			cellKey={cellKey}
			startPoint={edge.a}
			endPoint={edge.b}
			startMiterFactor={edge.startMiterFactor}
			endMiterFactor={edge.endMiterFactor}
			startNeighborDir={edge.startNeighborDir}
			endNeighborDir={edge.endNeighborDir}
			height={height}
			kind={edge.kind}
			skinId={skinId}
			outline={shieldActive}
			zIndex={zIndex}
		/>
	);
}

export const WallWithKey = memo(WallWithKeyComponent);

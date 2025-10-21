import { map, useInterval } from "@rbxts/pretty-react-hooks";
import React, { Element, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useDefined, useStore } from "client/hooks";
import { selectWorldSubjectDesiredAngle, selectWorldSubjectPosition } from "client/store/world";
import { CanvasGroup } from "client/ui/canvas-group";
import { selectSoldiersById, selectTopSoldier } from "shared/store/soldiers";

import { MinimapCursor } from "./minimap-cursor";
import { MinimapTracer } from "./minimap-tracer";
import { isValidPlayer, normalizeToWorldBounds, useFriendsInServer } from "./utils";

export function MinimapNodes() {
	const store = useStore();
	const soldierPosition = useDefined(useSelector(selectWorldSubjectPosition));
	const soldierAngle = useDefined(useSelector(selectWorldSubjectDesiredAngle));

	const friends = useFriendsInServer();

	const [nodes, setNodes] = useState<Element[]>([]);

	const update = () => {
		const nodes: Element[] = [];

		// this doesn't need useSelector so we can avoid unneeded re-renders
		const soldiers = store.getState(selectSoldiersById);
		const topSoldier = store.getState(selectTopSoldier);

		for (const [, soldier] of pairs(soldiers)) {
			const size = soldier.tracers.size();
			const step = math.floor(map(size, 0, 100, 2, 10));

			const isPlayer = isValidPlayer(soldier.id);
			const isFriend = friends.includes(soldier.id);
			const isLeader = topSoldier?.id === soldier.id;

			for (let i = 0; i < size - 1; i += step) {
				const point = soldier.tracers[i];
				const nextPoint = soldier.tracers[i + 1];

				nodes.push(
					<MinimapTracer
						key={`tracer-${soldier.id}-${i}`}
						from={normalizeToWorldBounds(point)}
						to={normalizeToWorldBounds(nextPoint)}
						isPlayer={isPlayer}
						isFriend={isFriend}
						isLeader={isLeader}
					/>,
				);
			}

			const polygonSize = soldier.polygon.size();

			for (let i = 0; i < polygonSize - 1; i += step) {
				const point = soldier.polygon[i];
				const nextPoint = soldier.polygon[i + 1];

				nodes.push(
					<MinimapTracer
						key={`poly-${soldier.id}-${i}`}
						from={normalizeToWorldBounds(point)}
						to={normalizeToWorldBounds(nextPoint)}
						isPlayer={isPlayer}
						isFriend={isFriend}
						isLeader={isLeader}
					/>,
				);
			}
		}

		setNodes(nodes);
	};

	useInterval(update, 2, { immediate: true });

	return (
		<>
			<CanvasGroup
				groupTransparency={0.5}
				backgroundTransparency={1}
				cornerRadius={new UDim(1, 0)}
				size={new UDim2(1, 0, 1, 0)}
			>
				{nodes}
			</CanvasGroup>

			{soldierPosition && <MinimapCursor point={normalizeToWorldBounds(soldierPosition)} angle={soldierAngle} />}
		</>
	);
}

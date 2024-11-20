import { map, useInterval } from "@rbxts/pretty-react-hooks";
import React, { Element, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { CanvasGroup } from "client/components/ui/canvas-group";
import { useDefined, useStore } from "client/hooks";
import { selectSoldierFromWorldSubject } from "client/store/world";
import { selectSoldiersById, selectTopSoldier } from "shared/store/soldiers";

import { MinimapCursor } from "./minimap-cursor";
import { MinimapTracer } from "./minimap-tracer";
import { isValidPlayer, normalizeToWorldBounds, useFriendsInServer } from "./utils";

export function MinimapNodes() {
	const store = useStore();
	const soldier = useDefined(useSelector(selectSoldierFromWorldSubject));
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
			let previous = soldier.position;

			const isPlayer = isValidPlayer(soldier.id);
			const isFriend = friends.includes(soldier.id);
			const isLeader = topSoldier?.id === soldier.id;

			for (const index of $range(0, size - 1, step)) {
				const tracer = soldier.tracers[index];

				nodes.push(
					<MinimapTracer
						key={`${soldier.id}-${index}`}
						from={normalizeToWorldBounds(previous)}
						to={normalizeToWorldBounds(tracer)}
						isPlayer={isPlayer}
						isFriend={isFriend}
						isLeader={isLeader}
					/>,
				);

				previous = tracer;
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

			{soldier && <MinimapCursor point={normalizeToWorldBounds(soldier.position)} angle={soldier.angle} />}
		</>
	);
}

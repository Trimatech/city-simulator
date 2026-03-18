import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { Element, useState } from "@rbxts/react";
import { CanvasGroup, Frame } from "@rbxts-ui/primitives";
import { useObserverPosition, useStore } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";
import { getWallSkin } from "shared/constants/skins";
import { selectLocalSoldierId, selectSoldiersById, selectSoldierSkin } from "shared/store/soldiers";

import { normalizeToWorldBounds } from "./utils";

const SoldierNode = ({ id, color, sizePx, pos }: { id: string; color: Color3; sizePx: number; pos: Vector2 }) => {
	const rem = useRem();

	return (
		<Frame
			key={`soldier-${id}`}
			backgroundColor={color}
			backgroundTransparency={0.3}
			cornerRadius={new UDim(1, 0)}
			size={new UDim2(0, sizePx, 0, sizePx)}
			position={new UDim2(pos.X, 0, pos.Y, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
		>
			<uicorner CornerRadius={cornerRadiusFull} />
			<uistroke Color={palette.black} Transparency={0} Thickness={rem(0.1)} />
		</Frame>
	);
};

function LocalSoldierNode({ sizePx }: { sizePx: number }) {
	const store = useStore();
	const observerPosition = useObserverPosition();

	const localId = store.getState(selectLocalSoldierId);
	if (localId === undefined) return undefined;

	const skinId = store.getState(selectSoldierSkin(localId));
	const color = skinId !== undefined ? getWallSkin(skinId).tint : palette.offwhite;

	if (observerPosition === undefined) return undefined;
	const pos = normalizeToWorldBounds(observerPosition);

	return <SoldierNode key={`soldier-${localId}`} id={localId} color={color} sizePx={sizePx} pos={pos} />;
}

export function MinimapNodes() {
	const rem = useRem();
	const store = useStore();

	const [nodes, setNodes] = useState<Element[]>([]);

	const enemySize = rem(0.5);
	const localSize = rem(1);

	const update = () => {
		const nodes: Element[] = [];

		// this doesn't need useSelector so we can avoid unneeded re-renders
		const soldiers = store.getState(selectSoldiersById);
		const localId = store.getState(selectLocalSoldierId);

		for (const [, soldier] of pairs(soldiers)) {
			const pos = normalizeToWorldBounds(soldier.position);
			const skinId = store.getState(selectSoldierSkin(soldier.id));
			const color = skinId !== undefined ? getWallSkin(skinId).tint : palette.offwhite;
			const isLocal = soldier.id === localId;
			const sizePx = isLocal ? localSize : enemySize;

			if (!isLocal) {
				nodes.push(
					<SoldierNode
						key={`soldier-${soldier.id}`}
						id={soldier.id}
						color={color}
						sizePx={sizePx}
						pos={pos}
					/>,
				);
			}
		}

		setNodes(nodes);
	};

	useInterval(update, 2, { immediate: true });

	return (
		<CanvasGroup
			backgroundTransparency={1}
			cornerRadius={new UDim(1, 0)}
			size={new UDim2(1, 0, 1, 0)}
			position={new UDim2(0.5, 0, 0.5, 0)}
			anchorPoint={new Vector2(0.5, 0.5)}
			clipsDescendants={true}
		>
			<uicorner CornerRadius={cornerRadiusFull} />
			{nodes}
			<LocalSoldierNode sizePx={localSize} />
		</CanvasGroup>
	);
}

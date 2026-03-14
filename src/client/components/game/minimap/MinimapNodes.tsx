import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { Element, useState } from "@rbxts/react";
import { CanvasGroup, Image } from "@rbxts-ui/primitives";
import { useObserverPosition, useStore } from "client/hooks";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { getWallSkin } from "shared/constants/skins";
import { selectLocalSoldierId, selectSoldiersById, selectSoldierSkin } from "shared/store/soldiers";

import { normalizeToWorldBounds } from "./utils";

export function MinimapNodes() {
	const store = useStore();
	const observerPosition = useObserverPosition();

	const [nodes, setNodes] = useState<Element[]>([]);

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
			const sizePx = isLocal ? 5 : 3;

			if (!isLocal) {
				nodes.push(
					<Image
						key={`soldier-${soldier.id}`}
						image={assets.ui.circle}
						imageColor3={color}
						anchorPoint={new Vector2(0.5, 0.5)}
						size={new UDim2(0, sizePx, 0, sizePx)}
						position={new UDim2(pos.X, 0, pos.Y, 0)}
					/>,
				);
			}
		}

		setNodes(nodes);
	};

	useInterval(update, 2, { immediate: true });

	return (
		<CanvasGroup
			groupTransparency={0.5}
			backgroundTransparency={1}
			cornerRadius={new UDim(1, 0)}
			size={new UDim2(1, 0, 1, 0)}
		>
			{nodes}
			{(() => {
				const localId = store.getState(selectLocalSoldierId);
				if (localId === undefined) return undefined;
				const skinId = store.getState(selectSoldierSkin(localId));
				const color = skinId !== undefined ? getWallSkin(skinId).tint : palette.offwhite;
				const current = observerPosition;
				if (current === undefined) return undefined;
				const pos = normalizeToWorldBounds(current);
				return (
					<Image
						key={`soldier-${localId}`}
						image={assets.ui.circle}
						imageColor3={color}
						anchorPoint={new Vector2(0.5, 0.5)}
						size={new UDim2(0, 5, 0, 5)}
						position={new UDim2(pos.X, 0, pos.Y, 0)}
					/>
				);
			})()}
		</CanvasGroup>
	);
}

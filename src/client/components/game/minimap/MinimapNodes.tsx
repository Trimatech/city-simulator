import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { Element, useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { CanvasGroup, Frame, Text } from "@rbxts-ui/primitives";
import { useObserverPosition, useStore } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";
import { cornerRadiusFull } from "shared/constants/sizes";
import { getWallSkin } from "shared/constants/skins";
import {
	selectLeaderId,
	selectLocalSoldierId,
	selectSoldierById,
	selectSoldiersById,
	selectSoldierSkin,
} from "shared/store/soldiers";

import { normalizeToWorldBounds, useFriendsInServer } from "./utils";

const SoldierNode = ({
	id,
	color,
	isLocal = false,
	pos,
	isFriend = false,
	isLeader = false,
}: {
	id: string;
	color: Color3;
	isLocal?: boolean;
	pos: Vector2;
	isFriend?: boolean;
	isLeader?: boolean;
}) => {
	const rem = useRem();
	const enemySize = rem(0.5);
	const localSize = rem(1);
	const sizePx = isLocal ? localSize : enemySize;

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
			<uistroke
				Color={isLeader ? palette.claimYellow : isFriend ? palette.green : palette.overlay0}
				Transparency={0}
				Thickness={rem(0.1)}
			/>
			{isLeader && (
				<Text
					text="👑"
					textSize={isLocal ? rem(1.3) : rem(0.8)}
					anchorPoint={new Vector2(0.5, 1)}
					position={new UDim2(0.5, 0, 0.3, 0)}
					automaticSize={Enum.AutomaticSize.XY}
					textTransparency={0.2}
					zIndex={3}
				/>
			)}
		</Frame>
	);
};

function LocalSoldierNode() {
	const store = useStore();
	const observerPosition = useObserverPosition();
	const leaderId = useSelector(selectLeaderId);

	const localId = useSelector(selectLocalSoldierId);
	if (localId === undefined) return undefined;
	const localSoldier = store.getState(selectSoldierById(localId));
	if (localSoldier === undefined) return undefined;

	const skinId = store.getState(selectSoldierSkin(localId));
	const color = skinId !== undefined ? getWallSkin(skinId).tint : palette.offwhite;
	const position = observerPosition ?? localSoldier.position;
	const pos = normalizeToWorldBounds(position);

	return (
		<SoldierNode
			key={`soldier-${localId}`}
			id={localId}
			color={color}
			isLocal={true}
			pos={pos}
			isLeader={localId === leaderId}
		/>
	);
}

export function MinimapNodes() {
	const store = useStore();
	const friends = useFriendsInServer();
	const leaderId = useSelector(selectLeaderId);

	const [nodes, setNodes] = useState<Element[]>([]);

	const update = () => {
		const nodes: Element[] = [];

		const soldiers = store.getState(selectSoldiersById);
		const localId = store.getState(selectLocalSoldierId);
		const currentLeaderId = store.getState(selectLeaderId);

		for (const [, soldier] of pairs(soldiers)) {
			if (soldier === undefined) {
				continue;
			}

			if (soldier.dead) {
				continue;
			}

			const pos = normalizeToWorldBounds(soldier.position);
			const skinId = store.getState(selectSoldierSkin(soldier.id));
			const color = skinId !== undefined ? getWallSkin(skinId).tint : palette.offwhite;
			const isLocal = soldier.id === localId;
			const isFriend = friends.includes(soldier.id);
			const isLeader = soldier.id === currentLeaderId;

			if (!isLocal) {
				nodes.push(
					<SoldierNode
						key={`soldier-${soldier.id}`}
						id={soldier.id}
						color={color}
						pos={pos}
						isFriend={isFriend}
						isLeader={isLeader}
					/>,
				);
			}
		}

		setNodes(nodes);
	};

	useEffect(() => {
		update();
	}, [leaderId]);

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
			<LocalSoldierNode />
		</CanvasGroup>
	);
}

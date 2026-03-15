import React, { useRef } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { Group } from "@rbxts-ui/primitives";
import { useDefined } from "client/hooks";
import { FlyToComponents } from "client/ui/FlyTo/FlyToComponents";
import { useRem } from "client/ui/rem/useRem";
import { formatInteger } from "client/utils/format-integer";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { ROOT_PADDING } from "shared/constants/theme";
import { selectPlayerBalance } from "shared/store/saves";
import {
	selectLocalEliminations,
	selectLocalOrbs,
	selectLocalPolygonAreaSize,
	selectRankForDisplay,
} from "shared/store/soldiers";

import { StatsCard } from "./StatsCard";

export function Stats() {
	const rem = useRem();

	const eliminationsRef = useRef<Frame>();
	const orbsRef = useRef<Frame>();
	const balanceRef = useRef<Frame>();

	const currentEliminations = useSelector(selectLocalEliminations);
	const currentOrbs = useSelector(selectLocalOrbs);
	const currentRank = useSelector(selectRankForDisplay);
	const currentBalance = useSelectorCreator(selectPlayerBalance, USER_NAME);
	const currentArea = useSelector(selectLocalPolygonAreaSize);
	// displays the previous value if any are set to undefined
	const eliminations = useDefined<string | number>(currentEliminations, "N/A");
	const area = useDefined<string | number>(currentArea, "N/A");
	const orbs = useDefined<string | number>(currentOrbs, "N/A");
	const rank = useDefined(currentRank, "N/A");
	const balance = useDefined(currentBalance, 0);

	return (
		<>
			<Group name="Stats">
				<uipadding PaddingBottom={new UDim(0, rem(ROOT_PADDING))} PaddingLeft={new UDim(0, rem(ROOT_PADDING))} />
				<uilistlayout
					FillDirection="Vertical"
					HorizontalAlignment="Left"
					VerticalAlignment="Bottom"
					Padding={new UDim(0, rem(1))}
					SortOrder="LayoutOrder"
				/>
				<StatsCard
					emoji="☠️"
					label="KOs"
					value={`${formatInteger(eliminations)}`}
					colorStyle="red"
					enabled={currentEliminations !== undefined}
					order={0}
					iconRef={eliminationsRef}
				/>
				<StatsCard
					emoji="🏆"
					label="Rank"
					value={rank}
					colorStyle="gold"
					enabled={currentRank !== undefined}
					order={1}
				/>
				<StatsCard
					emoji="🔮"
					label="Orbs"
					value={`${formatInteger(orbs)}`}
					colorStyle="purple"
					enabled={currentOrbs !== undefined}
					order={2}
					iconRef={orbsRef}
				/>
				<StatsCard
					emoji="💵"
					label="Cash"
					value={`$${formatInteger(balance)}`}
					colorStyle="green"
					enabled={currentBalance !== undefined}
					order={3}
					iconRef={balanceRef}
				/>
				<StatsCard
					emoji="🗺️"
					label="Area2"
					value={`${formatInteger(area)} studs²`}
					colorStyle="teal"
					enabled={currentArea !== undefined}
					order={4}
				/>
			</Group>

			<FlyToComponents
				amount={currentEliminations ?? 0}
				statsImageRef={eliminationsRef}
				image={assets.ui.shards_icon}
				sound={assets.sounds.thump_sound}
			/>
			<FlyToComponents
				amount={currentOrbs ?? 0}
				statsImageRef={orbsRef}
				image={assets.ui.crystals.crystals_1}
				sound={assets.sounds.bong_001}
			/>
			<FlyToComponents
				amount={currentBalance ?? 0}
				statsImageRef={balanceRef}
				image={assets.ui.shop.Cash}
				sound={assets.sounds.alert_money}
			/>
		</>
	);
}

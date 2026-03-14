import React from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { Group } from "@rbxts-ui/primitives";
import { useDefined } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { formatInteger } from "client/utils/format-integer";
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
				colorStyle="gold"
				enabled={currentEliminations !== undefined}
				order={0}
			/>

			<StatsCard
				emoji="🏆"
				label="Rank"
				value={rank}
				colorStyle="gold"
				enabled={currentRank !== undefined}
				order={0}
			/>

			<StatsCard
				emoji="🗺️"
				label="Area"
				value={`${formatInteger(area)} studs²`}
				colorStyle="teal"
				enabled={currentArea !== undefined}
				order={0}
			/>

			<StatsCard
				emoji="🔮"
				label="Orbs"
				value={`${formatInteger(orbs)}`}
				colorStyle="red"
				enabled={currentOrbs !== undefined}
				order={1}
			/>

			<StatsCard
				emoji="💵"
				label="Cash"
				value={`$${formatInteger(balance)}`}
				colorStyle="green"
				enabled={currentBalance !== undefined}
				order={2}
			/>
		</Group>
	);
}

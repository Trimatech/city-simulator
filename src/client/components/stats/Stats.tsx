import React from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { useDefined, useRem } from "client/hooks";
import { Group } from "@rbxts-ui/primitives";
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
				primary={Color3.fromRGB(194, 196, 222)}
				secondary={Color3.fromRGB(97, 97, 138)}
				enabled={currentEliminations !== undefined}
				order={0}
			/>

			<StatsCard
				emoji="🏆"
				label="Rank"
				value={rank}
				primary={Color3.fromRGB(255, 203, 80)}
				secondary={Color3.fromRGB(255, 150, 79)}
				enabled={currentRank !== undefined}
				order={0}
			/>

			<StatsCard
				emoji="🔮"
				label="Orbs"
				value={`${formatInteger(orbs)}`}
				primary={Color3.fromRGB(252, 69, 69)}
				secondary={Color3.fromRGB(150, 59, 84)}
				enabled={currentOrbs !== undefined}
				order={1}
			/>

			<StatsCard
				emoji="💵"
				label="Cash"
				value={`$${formatInteger(balance)}`}
				primary={Color3.fromRGB(111, 158, 79)}
				secondary={Color3.fromRGB(153, 181, 107)}
				enabled={currentBalance !== undefined}
				order={2}
			/>
			<StatsCard
				emoji="🗺️"
				label="Area"
				value={`${formatInteger(area)} studs²`}
				primary={Color3.fromRGB(186, 250, 255)}
				secondary={Color3.fromRGB(8, 89, 255)}
				enabled={currentArea !== undefined}
				order={0}
			/>
		</Group>
	);
}

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
import { selectPlayerBalance, selectPlayerCrystals } from "shared/store/saves";
import {
	selectLocalEliminations,
	selectLocalOrbs,
	selectLocalPolygonAreaSize,
	selectRankForDisplay,
} from "shared/store/soldiers";

import { StatsCard } from "./StatsCard";

export function Stats() {
	const rem = useRem();

	const eliminationsRef = useRef<ImageLabel>();
	const orbsRef = useRef<ImageLabel>();
	const balanceRef = useRef<ImageLabel>();
	const crystalsRef = useRef<ImageLabel>();

	const currentEliminations = useSelector(selectLocalEliminations);
	const currentOrbs = useSelector(selectLocalOrbs);
	const currentRank = useSelector(selectRankForDisplay);
	const currentBalance = useSelectorCreator(selectPlayerBalance, USER_NAME);
	const currentArea = useSelector(selectLocalPolygonAreaSize);
	const currentCrystals = useSelectorCreator(selectPlayerCrystals, USER_NAME);
	// displays the previous value if any are set to undefined
	const eliminations = useDefined<string | number>(currentEliminations, "N/A");
	const area = useDefined<string | number>(currentArea, "N/A");
	const orbs = useDefined<string | number>(currentOrbs, "N/A");
	const rank = useDefined(currentRank, "N/A");
	const balance = useDefined(currentBalance, 0);
	const crystals = useDefined(currentCrystals, 0);

	return (
		<>
			<Group name="Stats">
				<uipadding
					PaddingBottom={new UDim(0, rem(ROOT_PADDING))}
					PaddingLeft={new UDim(0, rem(ROOT_PADDING))}
				/>
				<uilistlayout
					FillDirection="Vertical"
					HorizontalAlignment="Left"
					VerticalAlignment="Bottom"
					Padding={new UDim(0, rem(1))}
					SortOrder="LayoutOrder"
				/>
				<StatsCard
					image={assets.ui.icons.kills}
					label="KOs"
					value={`${formatInteger(eliminations)}`}
					colorStyle="red"
					enabled={currentEliminations !== undefined}
					order={0}
					iconRef={eliminationsRef}
				/>
				<StatsCard
					image={assets.ui.icons.rank}
					label="Rank"
					value={rank}
					colorStyle="gold"
					enabled={currentRank !== undefined}
					order={1}
				/>
				<StatsCard
					image={assets.ui.icons.orb}
					label="Orbs"
					value={`${formatInteger(orbs)}`}
					colorStyle="purple"
					enabled={currentOrbs !== undefined}
					order={2}
					iconRef={orbsRef}
				/>
				<StatsCard
					image={assets.ui.shop.Cash}
					label="Cash"
					value={`$${formatInteger(balance)}`}
					colorStyle="green"
					enabled={currentBalance !== undefined}
					order={3}
					iconRef={balanceRef}
				/>
				<StatsCard
					image={assets.ui.shards_icon_color}
					label="Crystals"
					value={`${formatInteger(crystals)}`}
					colorStyle="cyan"
					enabled={currentCrystals !== undefined}
					order={4}
					iconRef={crystalsRef}
				/>
				<StatsCard
					image={assets.ui.icons.area}
					label="Area"
					value={`${formatInteger(area)} studs²`}
					colorStyle="teal"
					enabled={currentArea !== undefined}
					order={5}
				/>
			</Group>

			<FlyToComponents
				amount={currentEliminations ?? 0}
				statsImageRef={eliminationsRef}
				image={assets.ui.icons.kills}
				sound={assets.sounds.thump_sound}
				startFromCharacter={true}
				imageTransparency={0.1}
				startScale={5}
			/>
			<FlyToComponents
				amount={currentOrbs ?? 0}
				statsImageRef={orbsRef}
				image={assets.ui.icons.orb}
				sound={assets.sounds.bong_001}
				startFromCharacter={true}
				imageTransparency={0.3}
				startScale={1}
			/>
			<FlyToComponents
				amount={currentBalance ?? 0}
				statsImageRef={balanceRef}
				image={assets.ui.shop.Cash}
				sound={assets.sounds.alert_money}
				startFromCharacter={true}
				imageTransparency={0.3}
				startScale={1}
			/>
			<FlyToComponents
				amount={currentCrystals ?? 0}
				statsImageRef={crystalsRef}
				image={assets.ui.shards_icon_color}
				sound={assets.sounds.alert_neutral}
				startFromCharacter={true}
				imageTransparency={0.3}
				startScale={1}
			/>
		</>
	);
}

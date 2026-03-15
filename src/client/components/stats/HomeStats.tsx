import React from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { Group } from "@rbxts-ui/primitives";
import { useDefined } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { formatInteger } from "client/utils/format-integer";
import assets from "shared/assets";
import { USER_NAME } from "shared/constants/core";
import { ROOT_PADDING } from "shared/constants/theme";
import { selectPlayerBalance } from "shared/store/saves";

import { StatsCard } from "./StatsCard";

export function HomeStats() {
	const rem = useRem();

	const currentBalance = useSelectorCreator(selectPlayerBalance, USER_NAME);

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
				image={assets.ui.shop.Cash}
				label="Cash"
				value={`$${formatInteger(balance)}`}
				colorStyle="green"
				enabled={currentBalance !== undefined}
				order={2}
			/>
		</Group>
	);
}

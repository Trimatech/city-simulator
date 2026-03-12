import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { useRem } from "client/ui/rem/useRem";

import { Tab } from "./Tab";

interface TabI {
	text: string;
	id: number;
	emoji: string;
}

interface Props {
	Position?: UDim2;
	onClick?: Callback;
	ZIndex?: number;
	tabs: TabI[];
	activeTabId: number;
	setActiveTabId: (id: number) => void;
}

export function Tabs({ tabs, activeTabId, setActiveTabId }: Props) {
	const rem = useRem();

	const height = rem(8);

	const padding = rem(2);

	return (
		<Frame key="Tabs" size={new UDim2(1, 0, 0, height)} position={new UDim2(0, 0, 0, 0)}>
			<uipadding key="uipadding" PaddingLeft={new UDim(0, padding)} PaddingRight={new UDim(0, padding)} />
			<HStack key="TabButtons" size={new UDim2(1, 0, 1, 0)} spacing={rem(1)}>
				{tabs.map((tab, index) => (
					<Tab
						key={tab.id}
						label={tab.text.upper()}
						active={activeTabId === tab.id}
						onClick={() => setActiveTabId(tab.id)}
						order={index}
						emoji={tab.emoji}
					/>
				))}
			</HStack>
		</Frame>
	);
}

import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";

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

	const height = rem(10);

	return (
		<Frame key="Tabs" size={new UDim2(1, 0, 0, height)} position={new UDim2(0, 0, 0, 0)}>
			<uipadding key="uipadding" PaddingLeft={new UDim(0, rem(3))} PaddingRight={new UDim(0, rem(3))} />
			<HStack key="TabButtons" size={new UDim2(1, 0, 1, 0)} spacing={rem(1)}>
				{tabs.map((tab, index) => (
					<Tab
						key={tab.id}
						label={tab.text.upper()}
						active={activeTabId === tab.id}
						onClick={() => setActiveTabId(tab.id)}
						order={index}
						emoji={tab.emoji}
						enabled
					/>
				))}
			</HStack>
		</Frame>
	);
}

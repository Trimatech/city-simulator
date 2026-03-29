import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { useRem } from "client/ui/rem/useRem";
import { MILESTONE_CATEGORIES } from "shared/constants/lifetime-milestones";

import { MilestoneItem, MilestoneItemData } from "./MilestoneItem";

const killsCategory = MILESTONE_CATEGORIES[0];

const controls = {
	current: Number(10, 0, 100, 1),
	target: Number(25, 1, 5000, 1),
	celebrating: Boolean(false),
};

function StoryContent({ current, target, celebrating }: { current: number; target: number; celebrating: boolean }) {
	const rem = useRem();

	const data: MilestoneItemData = {
		category: killsCategory,
		tierName: "Warrior",
		current,
		target,
		ratio: current / target,
	};

	return (
		<frame
			BackgroundTransparency={1}
			Size={new UDim2(0, rem(22), 0, rem(6))}
			Position={new UDim2(0.5, rem(-11), 0.5, rem(-3))}
		>
			<MilestoneItem data={data} celebrating={celebrating} />
		</frame>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const c = props.controls;
		return (
			<StoryContent
				current={c.current as number}
				target={c.target as number}
				celebrating={c.celebrating as boolean}
			/>
		);
	},
};

export = story;

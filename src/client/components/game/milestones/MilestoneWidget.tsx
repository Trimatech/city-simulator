import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { VStack } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { USER_NAME } from "shared/constants/core";
import { MILESTONE_CATEGORIES, MilestoneCategory, MilestoneProgress } from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import { selectPlayerMilestoneProgress } from "shared/store/saves";

import { MilestoneItem } from "./MilestoneItem";
import { useClosestMilestones } from "./useClosestMilestones";

const NEXT_MILESTONE_DELAY = 2.0;

export function MilestoneWidget() {
	const rem = useRem();
	const milestones = useClosestMilestones(2);
	const progress = useSelectorCreator(selectPlayerMilestoneProgress, USER_NAME);

	const prevProgressRef = useRef<MilestoneProgress | undefined>(undefined);
	const [celebratingCategories, setCelebratingCategories] = useState<Set<MilestoneCategory>>(new Set());

	useEffect(() => {
		const prev = prevProgressRef.current;
		if (prev && progress) {
			const newCelebrations = new Set<MilestoneCategory>();
			for (const cat of MILESTONE_CATEGORIES) {
				const prevTier = prev[cat.id] ?? 0;
				const currentTier = progress[cat.id] ?? 0;
				if (currentTier > prevTier) {
					newCelebrations.add(cat.id);
				}
			}
			if (newCelebrations.size() > 0) {
				setCelebratingCategories(newCelebrations);
				task.delay(NEXT_MILESTONE_DELAY, () => {
					setCelebratingCategories(new Set());
				});
			}
		}
		prevProgressRef.current = progress;
	}, [progress]);

	if (milestones.size() === 0) {
		return (
			<Frame
				position={new UDim2(0, 0, 0.5, 0)}
				size={new UDim2(0, rem(22), 0, rem(3))}
				backgroundColor={palette.crust}
				backgroundTransparency={0.25}
			>
				<uicorner CornerRadius={new UDim(0, rem(0.8))} />
				<Text
					font={fonts.fredokaOne.regular}
					text="All milestones complete!"
					textColor={palette.yellow}
					textSize={rem(1.1)}
					size={new UDim2(1, 0, 1, 0)}
					backgroundTransparency={1}
				/>
			</Frame>
		);
	}

	return (
		<VStack size={new UDim2(0, rem(22), 0, 0)} spacing={rem(1)} automaticSize={Enum.AutomaticSize.Y}>
			{milestones.map((data) => (
				<MilestoneItem
					key={data.category.id}
					data={data}
					celebrating={celebratingCategories.has(data.category.id)}
				/>
			))}
		</VStack>
	);
}

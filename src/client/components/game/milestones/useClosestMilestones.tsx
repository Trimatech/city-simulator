import { useMemo } from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { USER_NAME } from "shared/constants/core";
import { getNextTier, MILESTONE_CATEGORIES, MilestoneCategory } from "shared/constants/lifetime-milestones";
import { selectPlayerLifetimeStat, selectPlayerMilestoneProgress } from "shared/store/saves";

import { MilestoneItemData } from "./MilestoneItem";

const NEXT_MILESTONE_DELAY = 2.0;

export function useClosestMilestones(count: number): MilestoneItemData[] {
	const progress = useSelectorCreator(selectPlayerMilestoneProgress, USER_NAME);

	const kills = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "kills" as MilestoneCategory);
	const area = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "area" as MilestoneCategory);
	const orbsEarned = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "orbsEarned" as MilestoneCategory);
	const timeAlive = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "timeAlive" as MilestoneCategory);
	const rank1 = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "rank1" as MilestoneCategory);
	const orbsSpent = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "orbsSpent" as MilestoneCategory);
	const gamesPlayed = useSelectorCreator(selectPlayerLifetimeStat, USER_NAME, "gamesPlayed" as MilestoneCategory);

	const statValues: Record<MilestoneCategory, number> = {
		kills: kills ?? 0,
		area: area ?? 0,
		orbsEarned: orbsEarned ?? 0,
		timeAlive: timeAlive ?? 0,
		rank1: rank1 ?? 0,
		orbsSpent: orbsSpent ?? 0,
		gamesPlayed: gamesPlayed ?? 0,
	};

	return useMemo(() => {
		const rows: MilestoneItemData[] = [];

		for (const cat of MILESTONE_CATEGORIES) {
			const completedTier = progress?.[cat.id] ?? 0;
			const nextTier = getNextTier(cat, completedTier);
			if (!nextTier) continue;

			const current = statValues[cat.id];
			const ratio = current / nextTier.threshold;

			rows.push({
				category: cat,
				tierName: nextTier.name,
				current,
				target: nextTier.threshold,
				ratio,
			});
		}

		rows.sort((a, b) => a.ratio > b.ratio);
		return rows.size() > count ? rows.move(0, count - 1, 0, []) : rows;
	}, [progress, kills, area, orbsEarned, timeAlive, rank1, orbsSpent, gamesPlayed]);
}

import React from "@rbxts/react";
import { useSelectorCreator } from "@rbxts/react-reflex";
import { formatInteger } from "client/utils/format-integer";
import { USER_NAME } from "shared/constants/core";
import {
	allMilestonesComplete,
	formatThreshold,
	getCurrentTierName,
	getMilestoneActionText,
	getNextTier,
	MILESTONE_CATEGORIES,
	MilestoneCategory,
} from "shared/constants/lifetime-milestones";
import {
	selectPlayerAscensionLevel,
	selectPlayerLifetimeStat,
	selectPlayerMilestoneProgress,
} from "shared/store/saves";

import { MILESTONE_EMOJIS } from "../constants";
import { ProgressCardItem } from "./ProgressCardItem";
import { SectionHeader } from "./SectionHeader";

export function LifetimeMilestones() {
	const progress = useSelectorCreator(selectPlayerMilestoneProgress, USER_NAME);
	const ascension = useSelectorCreator(selectPlayerAscensionLevel, USER_NAME);

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

	const allComplete = progress ? allMilestonesComplete(progress) : false;

	return (
		<>
			<SectionHeader text={ascension > 0 ? `Lifetime (Ascension ${ascension})` : "Lifetime Milestones"} />
			{MILESTONE_CATEGORIES.map((category) => {
				const completedTier = progress?.[category.id] ?? 0;
				const followingTier = getNextTier(category, completedTier);
				const currentName = getCurrentTierName(category, completedTier);
				const current = statValues[category.id];
				const accent = Color3.fromHex(category.accent);
				const emoji = MILESTONE_EMOJIS[category.id];

				if (!followingTier) {
					return (
						<ProgressCardItem
							key={category.id}
							title={`${emoji} ${currentName ?? category.label} - Complete!`}
							subtitle="All tiers completed"
							accent={accent}
							progress={1}
							valueText="MAX"
							progressLabel="100%"
						/>
					);
				}

				const progressRatio = current / followingTier.threshold;
				const actionText = getMilestoneActionText(category, followingTier.threshold);
				const rewardParts: string[] = [];
				if (followingTier.cashReward > 0) rewardParts.push(`$${formatInteger(followingTier.cashReward)}`);
				if (followingTier.crystalReward > 0) {
					rewardParts.push(
						`${followingTier.crystalReward} crystal${followingTier.crystalReward > 1 ? "s" : ""}`,
					);
				}
				if (followingTier.orbReward > 0) rewardParts.push(`${followingTier.orbReward} orbs`);
				if (followingTier.badge !== undefined) rewardParts.push("Badge");

				return (
					<ProgressCardItem
						key={category.id}
						title={`${emoji} ${actionText}`}
						subtitle={`${followingTier.name} | ${rewardParts.join(" + ")}`}
						accent={accent}
						progress={progressRatio}
						valueText={`${formatThreshold(category, math.min(current, followingTier.threshold))} / ${formatThreshold(category, followingTier.threshold)}`}
						progressLabel={`${math.floor(math.clamp(progressRatio, 0, 1) * 100)}%`}
					/>
				);
			})}
		</>
	);
}

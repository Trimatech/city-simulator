import React, { useEffect, useRef, useState } from "@rbxts/react";
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
	MilestoneProgress,
} from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import {
	selectPlayerAscensionLevel,
	selectPlayerLifetimeStat,
	selectPlayerMilestoneProgress,
} from "shared/store/saves";

import { MILESTONE_DARK_ACCENTS, MILESTONE_EMOJIS } from "../constants";
import { MilestoneCard } from "./MilestoneCard";
import { QuestProgressBar } from "./QuestProgressBar";
import { SectionHeader } from "./SectionHeader";

const CELEBRATION_DELAY = 1.8;

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

	// Track previous progress to detect tier completions
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
				task.delay(CELEBRATION_DELAY, () => {
					setCelebratingCategories(new Set());
				});
			}
		}
		prevProgressRef.current = progress;
	}, [progress]);

	const allComplete = progress ? allMilestonesComplete(progress) : false;

	return (
		<>
			<SectionHeader
				text={ascension > 0 ? `Lifetime (Ascension ${ascension})` : "Lifetime Milestones"}
			/>
			{MILESTONE_CATEGORIES.map((category) => {
				const completedTier = progress?.[category.id] ?? 0;
				const followingTier = getNextTier(category, completedTier);
				const currentName = getCurrentTierName(category, completedTier);
				const current = statValues[category.id];
				const accent = Color3.fromHex(category.accent);
				const emoji = MILESTONE_EMOJIS[category.id];
				const accentDark = MILESTONE_DARK_ACCENTS[category.id];
				const isCelebrating = celebratingCategories.has(category.id);

				if (!followingTier) {
					return (
						<MilestoneCard
							key={category.id}
							title={`${currentName ?? category.label} - Complete!`}
							subtitle="All tiers completed"
							emoji={emoji}
							accent={accent}
							accentDark={accentDark}
							progress={1}
							progressLabel="MAX"
							celebrating={isCelebrating}
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

				return (
					<MilestoneCard
						key={category.id}
						title={actionText}
						subtitle={`${followingTier.name} | ${rewardParts.join(" + ")}`}
						emoji={emoji}
						accent={accent}
						accentDark={accentDark}
						progress={progressRatio}
						progressLabel={`${formatThreshold(category, math.min(current, followingTier.threshold))} / ${formatThreshold(category, followingTier.threshold)}`}
						celebrating={isCelebrating}
					/>
				);
			})}
			{allComplete && (
				<QuestProgressBar
					progress={1}
					accent={palette.yellow}
					accentDark={Color3.fromHex("#4e3c00")}
					label="Ready to Ascend!"
					emoji="⭐"
					valueText="TAP"
				/>
			)}
		</>
	);
}

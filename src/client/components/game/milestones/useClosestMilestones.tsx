import { useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { USER_NAME } from "shared/constants/core";
import { getNextTier, MILESTONE_CATEGORIES, MilestoneCategory } from "shared/constants/lifetime-milestones";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { selectPlayerLifetimeStat, selectPlayerMilestoneProgress } from "shared/store/saves";
import { selectSoldierOrbs } from "shared/store/soldiers";

import { MilestoneItemData } from "./MilestoneItem";

/**
 * Tutorial-friendly priority: lower index = shown first.
 * orbsSpent is contextual — promoted when player has orbs, demoted otherwise.
 */
const TUTORIAL_ORDER: readonly MilestoneCategory[] = [
	"orbsEarned",
	"area",
	"kills",
	"gamesPlayed",
	"orbsSpent",
	"timeAlive",
	"rank1",
];

const CHEAPEST_POWERUP_COST = POWERUP_PRICES.turbo;

/** Interval (seconds) for rotating the random milestone slot. */
const ROTATE_INTERVAL = 30;

export interface PrioritizedMilestones {
	/** Top fixed milestones (tutorial-priority order). */
	readonly fixed: MilestoneItemData[];
	/** A random rotating milestone from the remaining pool, or undefined. */
	readonly rotating: MilestoneItemData | undefined;
}

export function usePrioritizedMilestones(fixedCount: number): PrioritizedMilestones {
	const progress = useSelectorCreator(selectPlayerMilestoneProgress, USER_NAME);
	const orbs = useSelector(selectSoldierOrbs(USER_NAME)) ?? 0;

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

	const [rotationTick, setRotationTick] = useState(0);

	useEffect(() => {
		const conn = task.delay(ROTATE_INTERVAL, () => {
			setRotationTick((t) => t + 1);
		});
		return () => task.cancel(conn);
	}, [rotationTick]);

	// Stable ref for random index so it only changes on rotationTick
	const randomIndexRef = useRef(0);

	return useMemo(() => {
		const canAffordPowerup = orbs >= CHEAPEST_POWERUP_COST;

		// Build all incomplete milestones
		const all: MilestoneItemData[] = [];
		for (const cat of MILESTONE_CATEGORIES) {
			const completedTier = progress?.[cat.id] ?? 0;
			const nextTier = getNextTier(cat, completedTier);
			if (!nextTier) continue;

			const current = statValues[cat.id];
			const ratio = current / nextTier.threshold;

			all.push({
				category: cat,
				tierName: nextTier.name,
				current,
				target: nextTier.threshold,
				ratio,
			});
		}

		// Sort by priority score
		const tutorialIndex = (id: MilestoneCategory) => {
			const idx = TUTORIAL_ORDER.indexOf(id);
			return idx === -1 ? TUTORIAL_ORDER.size() : idx;
		};

		all.sort((a, b) => {
			const aCompleted = progress?.[a.category.id] ?? 0;
			const bCompleted = progress?.[b.category.id] ?? 0;

			// First-tier milestones (never completed) always come before later tiers
			const aFirstTier = aCompleted === 0;
			const bFirstTier = bCompleted === 0;
			if (aFirstTier !== bFirstTier) return aFirstTier;

			// Within same tier level, use tutorial order
			const aIdx = tutorialIndex(a.category.id);
			const bIdx = tutorialIndex(b.category.id);

			// Contextual: demote orbsSpent if player can't afford any powerup
			const aOrbPenalty = !canAffordPowerup && a.category.id === "orbsSpent" ? 100 : 0;
			const bOrbPenalty = !canAffordPowerup && b.category.id === "orbsSpent" ? 100 : 0;

			// Boost orbsEarned if player can't afford powerups (encourage collecting)
			const aOrbBoost = !canAffordPowerup && a.category.id === "orbsEarned" ? -100 : 0;
			const bOrbBoost = !canAffordPowerup && b.category.id === "orbsEarned" ? -100 : 0;

			const aScore = aIdx + aOrbPenalty + aOrbBoost;
			const bScore = bIdx + bOrbPenalty + bOrbBoost;

			if (aScore !== bScore) return aScore < bScore;

			// Tie-break: closer to completion first
			return a.ratio > b.ratio;
		});

		// Split into fixed + pool
		const fixed = all.size() > fixedCount ? all.move(0, fixedCount - 1, 0, []) : [...all];
		const pool = all.size() > fixedCount ? all.move(fixedCount, all.size() - 1, 0, []) : [];

		// Pick a rotating milestone from the pool
		let rotating: MilestoneItemData | undefined;
		if (pool.size() > 0) {
			randomIndexRef.current = rotationTick % pool.size();
			rotating = pool[randomIndexRef.current];
		}

		return { fixed, rotating };
	}, [progress, kills, area, orbsEarned, timeAlive, rank1, orbsSpent, gamesPlayed, orbs, rotationTick]);
}

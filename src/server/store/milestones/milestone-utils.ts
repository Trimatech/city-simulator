import { WORLD_BOUNDS } from "shared/constants/core";
import { reverseArray } from "shared/polybool/poly-utils";

export type MilestoneState = {
	readonly [K in string]?: MilestoneEntity;
};

export interface MilestoneEntity {
	readonly topArea?: ScoreMilestone;
	readonly topRank: number;
	readonly lastKilled?: string;
}

export type ScoreMilestone = (typeof SCORE_MILESTONES)[number];

export const SCORE_MILESTONES = [
	5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000, 2_800_000,
] as const;

export const SCORE_MILESTONES_REVERSE = reverseArray(SCORE_MILESTONES as unknown as number[]) as ScoreMilestone[];

export const getMilestoneArea = (currentArea: number): ScoreMilestone => {
	const currentMilestone = SCORE_MILESTONES_REVERSE.find((milestoneArea) => currentArea >= milestoneArea);
	return currentMilestone as ScoreMilestone;
};

export const getMaxArea = () => {
	const radius = WORLD_BOUNDS;
	const area = math.pi * math.pow(radius, 2);
	return area;
};

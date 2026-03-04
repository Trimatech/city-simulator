export const DAILY_REWARD_CYCLE = 7;

export const DAILY_REWARD_TABLE: readonly number[] = [
	1, // Day 1
	2, // Day 2
	3, // Day 3
	4, // Day 4
	5, // Day 5
	7, // Day 6
	10, // Day 7
];

export function getDailyRewardAmount(streakDay: number): number {
	const index = (streakDay - 1) % DAILY_REWARD_CYCLE;
	return DAILY_REWARD_TABLE[index];
}

export const SECONDS_PER_DAY = 86400;

/** 48h window from last claim to keep the streak alive. */
export const DAILY_STREAK_WINDOW = SECONDS_PER_DAY * 2;

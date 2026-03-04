import { REWARD_CONFIGS, REWARD_TICK_INTERVAL, RewardType } from "shared/constants/rewards";
import { createScheduler } from "shared/utils/scheduler";

import { checkRewardPickups, getActiveRewardCount, populateRewards, spawnReward } from "./reward-utils";

export async function initRewardService() {
	// Pickup detection runs every REWARD_TICK_INTERVAL (1 second)
	createScheduler({
		name: "reward-pickup",
		tick: REWARD_TICK_INTERVAL,
		phase: 0,
		onTick: checkRewardPickups,
	});

	for (const [rewardType, config] of pairs(REWARD_CONFIGS)) {
		// Wait for initial delay before spawning
		if (config.initialDelay > 0) {
			task.wait(config.initialDelay);
		}

		// Initial population
		populateRewards(rewardType as RewardType);

		// Periodic spawning: add spawnCount rewards every spawnInterval seconds
		task.spawn(() => {
			for (;;) {
				task.wait(config.spawnInterval);
				for (let i = 0; i < config.spawnCount; i++) {
					spawnReward(rewardType as RewardType);
				}
				print(
					`[Rewards] Periodic spawn: added ${config.spawnCount} ${rewardType}, total active: ${getActiveRewardCount(rewardType as RewardType)}`,
				);
			}
		});
	}
}

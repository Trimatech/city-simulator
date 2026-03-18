import { WORLD_TICK } from "shared/constants/core";
import { REWARD_CONFIGS, RewardType } from "shared/constants/rewards";
import { createScheduler } from "shared/utils/scheduler";

import { checkRewardPickups, populateRewards } from "./reward-utils";

export async function initRewardService() {
	// Pickup detection runs every tick
	createScheduler({
		name: "reward-pickup",
		tick: WORLD_TICK,
		phase: 0,
		onTick: checkRewardPickups,
	});

	for (const [rewardType, config] of pairs(REWARD_CONFIGS)) {
		// Wait for initial delay before spawning
		if (config.initialDelay > 0) {
			task.wait(config.initialDelay);
		}

		// Spawn the initial crystal (only 1)
		populateRewards(rewardType as RewardType);
	}
}

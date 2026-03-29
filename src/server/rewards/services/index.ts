import { runOnce } from "shared/utils/run-once";

import { initBadgeService } from "./badges";
import { initLifetimeMilestoneService } from "./lifetime-milestones";
import { initMilestoneService } from "./milestones-saga";
import { initRewardService } from "./rewards";
import { initSocialFeedService } from "./social-feed";
import { initWinConditionService } from "./win-condition";

export const initRewardServices = runOnce(async () => {
	initBadgeService();
	initMilestoneService();
	initRewardService();
	initLifetimeMilestoneService();
	initSocialFeedService();
	initWinConditionService();
});

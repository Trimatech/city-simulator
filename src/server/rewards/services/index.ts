import { runOnce } from "shared/utils/run-once";

import { initBadgeService } from "./badges";
import { initMilestoneService } from "./milestones-saga";
import { initRewardService } from "./rewards";
import { initSocialFeedService } from "./social-feed";

export const initRewardServices = runOnce(async () => {
	initBadgeService();
	initMilestoneService();
	initRewardService();
	initSocialFeedService();
});

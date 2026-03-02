import { BadgeService } from "@rbxts/services";
import { store } from "server/store";
import {
	identifyMilestone,
	selectMilestoneArea,
	selectMilestoneRanking,
	selectMilestones,
} from "server/store/milestones";
import { ScoreMilestone } from "server/store/milestones/milestone-utils";
import { Badge } from "shared/assetsFolder";
import { getPlayerByName } from "shared/utils/player-utils";

import { shouldGrantBadge } from "../utils";

const RANKING_BADGES: { [K in number]?: Badge } = {
	1: Badge.FIRST_PLACE,
	2: Badge.SECOND_PLACE,
	3: Badge.THIRD_PLACE,
};

const AREA_BADGES: { [K in ScoreMilestone]?: Badge } = {
	25_000: Badge.AREA_25000,
	50_000: Badge.AREA_50000,
	100_000: Badge.AREA_100000,
};

export async function initBadgeService() {
	store.observe(selectMilestones, identifyMilestone, (_, id) => {
		return observeMilestone(id);
	});
}

function observeMilestone(id: string) {
	const unsubscribeRanking = store.subscribe(selectMilestoneRanking(id), (ranking) => {
		if (ranking !== undefined && ranking in RANKING_BADGES) {
			tryGrantBadge(id, RANKING_BADGES[ranking]!);
		}
	});

	const unsubscribeArea = store.subscribe(selectMilestoneArea(id), (area) => {
		if (area !== undefined && area in AREA_BADGES) {
			tryGrantBadge(id, AREA_BADGES[area]!);
		}
	});

	return () => {
		unsubscribeRanking();
		unsubscribeArea();
	};
}

async function tryGrantBadge(playerName: string, badgeId: number) {
	const player = getPlayerByName(playerName);

	if (player && shouldGrantBadge()) {
		try {
			BadgeService.AwardBadge(player.UserId, badgeId);
		} catch (e) {
			warn(`Failed to grant badge ${Badge[badgeId]} to ${player}: ${e}`);
		}
	}
}

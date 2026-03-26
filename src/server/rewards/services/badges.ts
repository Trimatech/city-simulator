import { BadgeService, Workspace } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { store } from "server/store";
import {
	identifyMilestone,
	selectMilestoneArea,
	selectMilestoneBotKillCount,
	selectMilestoneCandyCollected,
	selectMilestoneEliminationCount,
	selectMilestoneGiantSlain,
	selectMilestoneHeadOnVictory,
	selectMilestoneOrbsSpent,
	selectMilestonePowerupsUsed,
	selectMilestoneRank1Count,
	selectMilestoneRank1Since,
	selectMilestoneRanking,
	selectMilestoneReviveCount,
	selectMilestones,
	selectMilestoneShieldBlockedDeath,
	selectMilestoneTowerDestroyed,
} from "server/store/milestones";
import { Badge } from "shared/assetsFolder";
import { selectSoldierById, selectSoldierRanking } from "shared/store/soldiers";
import { getPlayerByName } from "shared/utils/player-utils";

import { shouldGrantBadge } from "../utils";

// --- Territory Milestones ---

const AREA_BADGES: { threshold: number; badge: Badge }[] = [
	{ threshold: 100_000, badge: Badge.SETTLER },
	{ threshold: 250_000, badge: Badge.LANDLORD },
	{ threshold: 500_000, badge: Badge.CONQUEROR },
	{ threshold: 1_000_000, badge: Badge.EMPIRE },
	{ threshold: 2_500_000, badge: Badge.WORLD_DOMINATOR },
];

// --- Ranking ---

const RANKING_BADGES: { [K in number]?: Badge } = {
	1: Badge.CHAMPION,
	2: Badge.RUNNER_UP,
	3: Badge.PODIUM,
};

// --- Elimination thresholds ---

const ELIMINATION_BADGES: { threshold: number; badge: Badge }[] = [
	{ threshold: 1, badge: Badge.FIRST_BLOOD },
	{ threshold: 5, badge: Badge.KILLING_SPREE },
	{ threshold: 10, badge: Badge.BOUNTY_HUNTER },
	{ threshold: 50, badge: Badge.EXECUTIONER },
	{ threshold: 100, badge: Badge.MASSACRE },
];

// --- Constants ---

const UNDEFEATED_CHECK_INTERVAL = 10;
const UNDEFEATED_DURATION = 300; // 5 minutes in seconds

const ALL_POWERUP_IDS = ["turbo", "shield", "tower", "laserBeam", "nuclearExplosion"];

export async function initBadgeService() {
	store.observe(selectMilestones, identifyMilestone, (_, id) => {
		return observeMilestone(id);
	});
}

function observeMilestone(id: string) {
	// --- Ranking badges ---
	const unsubscribeRanking = store.subscribe(selectMilestoneRanking(id), (ranking) => {
		if (ranking !== undefined && ranking in RANKING_BADGES) {
			tryGrantBadge(id, RANKING_BADGES[ranking]!);
		}

		// Track rank 1 for Repeat Champion and Undefeated
		if (ranking === 1) {
			const milestone = store.getState().milestones[id];
			if (milestone && milestone.rank1Since === 0) {
				store.setMilestoneRank1Since(id, Workspace.GetServerTimeNow());
				store.incrementMilestoneRank1Count(id);
			}
		} else {
			const milestone = store.getState().milestones[id];
			if (milestone && milestone.rank1Since !== 0) {
				store.setMilestoneRank1Since(id, 0);
			}
		}
	});

	// --- Area badges ---
	const unsubscribeArea = store.subscribe(selectMilestoneArea(id), (area) => {
		if (area === undefined) return;
		for (const { threshold, badge } of AREA_BADGES) {
			if (area >= threshold) {
				tryGrantBadge(id, badge);
			}
		}
	});

	// --- Elimination badges ---
	const unsubscribeEliminations = store.subscribe(selectMilestoneEliminationCount(id), (count) => {
		if (count === undefined) return;
		for (const { threshold, badge } of ELIMINATION_BADGES) {
			if (count >= threshold) {
				tryGrantBadge(id, badge);
			}
		}
	});

	// --- Bot Buster (10 bot kills in one life) ---
	const unsubscribeBotKills = store.subscribe(selectMilestoneBotKillCount(id), (count) => {
		if (count !== undefined && count >= 10) {
			tryGrantBadge(id, Badge.BOT_BUSTER);
		}
	});

	// --- Head-On Victor ---
	const unsubscribeHeadOn = store.subscribe(selectMilestoneHeadOnVictory(id), (victory) => {
		if (victory) {
			tryGrantBadge(id, Badge.HEAD_ON_VICTOR);
		}
	});

	// --- Giant Slayer ---
	const unsubscribeGiantSlain = store.subscribe(selectMilestoneGiantSlain(id), (slain) => {
		if (slain) {
			tryGrantBadge(id, Badge.GIANT_SLAYER);
		}
	});

	// --- Candy Collector (500 in one life) ---
	const unsubscribeCandy = store.subscribe(selectMilestoneCandyCollected(id), (count) => {
		if (count !== undefined && count >= 500) {
			tryGrantBadge(id, Badge.COLLECTOR);
		}
	});

	// --- Big Spender (1000 orbs on powerups in one life) ---
	const unsubscribeOrbsSpent = store.subscribe(selectMilestoneOrbsSpent(id), (spent) => {
		if (spent !== undefined && spent >= 1_000) {
			tryGrantBadge(id, Badge.BIG_SPENDER);
		}
	});

	// --- Individual powerup badges + Arsenal ---
	const POWERUP_BADGES: { [key: string]: Badge } = {
		turbo: Badge.SPEED_DEMON,
		tower: Badge.ARCHITECT,
		nuclearExplosion: Badge.NUCLEAR_OPTION,
	};

	const unsubscribePowerups = store.subscribe(selectMilestonePowerupsUsed(id), (used) => {
		if (!used) return;
		for (const powerupId of used) {
			const badge = POWERUP_BADGES[powerupId];
			if (badge !== undefined) {
				tryGrantBadge(id, badge);
			}
		}
		if (used.size() >= ALL_POWERUP_IDS.size()) {
			tryGrantBadge(id, Badge.ARSENAL);
		}
	});

	// --- Tower Destroyer ---
	const unsubscribeTowerDestroyed = store.subscribe(selectMilestoneTowerDestroyed(id), (destroyed) => {
		if (destroyed) {
			tryGrantBadge(id, Badge.TOWER_DESTROYER);
		}
	});

	// --- Shield Blocked Death ---
	const unsubscribeShieldBlocked = store.subscribe(selectMilestoneShieldBlockedDeath(id), (blocked) => {
		if (blocked) {
			tryGrantBadge(id, Badge.SHIELDED);
		}
	});

	// --- Revive badges (session-level) ---
	const unsubscribeRevives = store.subscribe(selectMilestoneReviveCount(id), (count) => {
		if (count !== undefined && count >= 1) {
			tryGrantBadge(id, Badge.SECOND_CHANCE);
		}
		if (count !== undefined && count >= 9) {
			tryGrantBadge(id, Badge.CATS_NINE_LIVES);
		}
	});

	// --- Repeat Champion (rank 1 ten times, session-level) ---
	const unsubscribeRank1Count = store.subscribe(selectMilestoneRank1Count(id), (count) => {
		if (count !== undefined && count >= 10) {
			tryGrantBadge(id, Badge.REPEAT_CHAMPION);
		}
	});

	// --- Undefeated (hold rank 1 for 5 min) --- check periodically
	const unsubscribeUndefeated = store.observeWhile(
		selectSoldierRanking(id),
		(rank = 4) => rank === 1,
		() => {
			return setInterval(() => {
				const milestone = store.getState().milestones[id];
				if (!milestone || milestone.rank1Since === 0) return;
				const elapsed = Workspace.GetServerTimeNow() - milestone.rank1Since;
				if (elapsed >= UNDEFEATED_DURATION) {
					tryGrantBadge(id, Badge.UNDEFEATED);
				}
			}, UNDEFEATED_CHECK_INTERVAL);
		},
	);

	// --- Untouchable (5 min without damage) --- check periodically
	// Initialize lastDamageAt to now so the timer starts from spawn
	store.setMilestoneLastDamageAt(id, Workspace.GetServerTimeNow());

	const unsubscribeUntouchable = store.observeWhile(
		selectSoldierById(id),
		(soldier) => soldier !== undefined && !soldier.dead,
		() => {
			return setInterval(() => {
				const milestone = store.getState().milestones[id];
				if (!milestone || milestone.lastDamageAt === 0) return;
				const elapsed = Workspace.GetServerTimeNow() - milestone.lastDamageAt;
				if (elapsed >= 300) {
					tryGrantBadge(id, Badge.UNTOUCHABLE);
				}
			}, UNDEFEATED_CHECK_INTERVAL);
		},
	);

	// --- Close Call (survive at under 10 HP) ---
	const unsubscribeCloseCall = store.subscribe(
		(state) => {
			const soldier = state.soldiers[id];
			return soldier && !soldier.dead ? soldier.health : undefined;
		},
		(health) => {
			if (health !== undefined && health > 0 && health < 10) {
				tryGrantBadge(id, Badge.CLOSE_CALL);
			}
		},
	);

	return () => {
		unsubscribeRanking();
		unsubscribeArea();
		unsubscribeEliminations();
		unsubscribeBotKills();
		unsubscribeHeadOn();
		unsubscribeGiantSlain();
		unsubscribeCandy();
		unsubscribeOrbsSpent();
		unsubscribePowerups();
		unsubscribeTowerDestroyed();
		unsubscribeShieldBlocked();
		unsubscribeRevives();
		unsubscribeRank1Count();
		unsubscribeUndefeated();
		unsubscribeUntouchable();
		unsubscribeCloseCall();
	};
}

// Exported so other services can grant badges directly for event-based conditions
export function tryGrantBadge(playerName: string, badgeId: number) {
	if (badgeId === 0) return; // Placeholder ID, badge not yet created in Roblox

	const player = getPlayerByName(playerName);

	if (player && shouldGrantBadge()) {
		Promise.try(() => {
			BadgeService.AwardBadge(player.UserId, badgeId);
		}).catch((e) => {
			warn(`Failed to grant badge ${badgeId} to ${player}: ${e}`);
		});
	}
}

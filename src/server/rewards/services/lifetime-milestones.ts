import { Workspace } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { store } from "server/store";
import {
	identifyMilestone,
	selectMilestoneEliminationCount,
	selectMilestoneRanking,
	selectMilestones,
} from "server/store/milestones";
import assets from "shared/assets";
import {
	getNextTier,
	getPassiveOrbRate,
	MILESTONE_CATEGORIES,
	MilestoneCategory,
	PASSIVE_ORB_INTERVAL,
} from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectPlayerBankedOrbs, selectPlayerLifetimeStat, selectPlayerMilestoneProgress } from "shared/store/saves";
import { selectSoldierArea, selectSoldierById, selectSoldierOrbs } from "shared/store/soldiers";
import { getPlayerByName } from "shared/utils/player-utils";

import { grantMoney, shouldGrantReward } from "../utils";
import { tryGrantBadge } from "./badges";

/** Track spawn time per player for time-alive accumulation. */
const spawnTimes = new Map<string, number>();

/** Track last orb count to detect orb gains. */
const lastOrbCount = new Map<string, number>();

export function initLifetimeMilestoneService() {
	store.observe(selectMilestones, identifyMilestone, (_, id) => {
		return observeLifetimeMilestones(id);
	});
}

function observeLifetimeMilestones(playerId: string) {
	// --- Games Played: increment on first spawn ---
	store.incrementLifetimeGamesPlayed(playerId);

	// --- Spawn time tracking ---
	spawnTimes.set(playerId, Workspace.GetServerTimeNow());

	// --- Area claimed: track increases in real-time like kills/orbs ---
	let prevArea = 0;
	const unsubscribeArea = store.subscribe(selectSoldierArea(playerId), (area) => {
		if (area === undefined) return;
		const delta = area - prevArea;
		if (delta > 0) {
			store.addLifetimeArea(playerId, math.floor(delta));
			checkMilestoneTiers(playerId, "area");
		}
		prevArea = area;
	});

	// --- Kills: subscribe to elimination count changes ---
	let prevKills = 0;
	const unsubscribeKills = store.subscribe(selectMilestoneEliminationCount(playerId), (count) => {
		if (count === undefined) return;
		const delta = count - prevKills;
		if (delta > 0) {
			store.addLifetimeKills(playerId, delta);
			checkMilestoneTiers(playerId, "kills");
		}
		prevKills = count;
	});

	// --- Orbs earned: track orb increases on the soldier ---
	const unsubscribeOrbs = store.subscribe(selectSoldierOrbs(playerId), (orbs) => {
		if (orbs === undefined) return;
		const prev = lastOrbCount.get(playerId) ?? 0;
		if (orbs > prev) {
			const gained = orbs - prev;
			store.addLifetimeOrbsEarned(playerId, gained);
			checkMilestoneTiers(playerId, "orbsEarned");
		}
		lastOrbCount.set(playerId, orbs);
	});

	// --- Orbs spent: subscribe to milestone orbs spent ---
	let prevOrbsSpent = 0;
	const unsubscribeOrbsSpent = store.subscribe(
		(state) => state.milestones[playerId]?.orbsSpentOnPowerups,
		(spent) => {
			if (spent === undefined) return;
			const delta = spent - prevOrbsSpent;
			if (delta > 0) {
				store.addLifetimeOrbsSpent(playerId, delta);
				checkMilestoneTiers(playerId, "orbsSpent");
			}
			prevOrbsSpent = spent;
		},
	);

	// --- Rank 1 tracking (lifetime) ---
	let wasRank1 = false;
	const unsubscribeRank1 = store.subscribe(selectMilestoneRanking(playerId), (ranking) => {
		if (ranking === 1 && !wasRank1) {
			store.incrementLifetimeRank1(playerId);
			checkMilestoneTiers(playerId, "rank1");
		}
		wasRank1 = ranking === 1;
	});

	// --- Passive orb income from territory ---
	const unsubscribePassiveOrbs = store.observeWhile(
		selectSoldierById(playerId),
		(soldier) => soldier !== undefined && !soldier.dead,
		() => {
			return setInterval(() => {
				const soldier = store.getState(selectSoldierById(playerId));
				if (!soldier || soldier.dead) return;

				const orbRate = getPassiveOrbRate(soldier.polygonAreaSize);
				if (orbRate > 0) {
					store.incrementSoldierOrbs(playerId, orbRate);

					const player = getPlayerByName(playerId);
					if (player) {
						remotes.client.alert.fire(player, {
							scope: "money",
							emoji: "🔮",
							color: palette.mauve,
							message: `+${orbRate} orbs from territory`,
							sound: assets.sounds.alert_money,
						});
					}
				}
			}, PASSIVE_ORB_INTERVAL);
		},
	);

	// --- Banked orbs: deposit on spawn ---
	const banked = store.getState(selectPlayerBankedOrbs(playerId));
	if (banked > 0) {
		store.incrementSoldierOrbs(playerId, banked);
		store.consumeBankedOrbs(playerId);

		const player = getPlayerByName(playerId);
		if (player) {
			remotes.client.alert.fire(player, {
				scope: "money",
				emoji: "🔮",
				color: palette.mauve,
				message: `+${banked} orbs from milestone rewards!`,
				sound: assets.sounds.alert_money,
			});
		}
	}

	// Check games played milestone immediately
	checkMilestoneTiers(playerId, "gamesPlayed");

	// --- Time alive: periodic accumulation ---
	const timeAliveInterval = setInterval(() => {
		const soldier = store.getState(selectSoldierById(playerId));
		if (!soldier || soldier.dead) return;
		store.addLifetimeTimeAlive(playerId, 60);
		checkMilestoneTiers(playerId, "timeAlive");
	}, 60);

	return () => {
		unsubscribeKills();
		unsubscribeOrbs();
		unsubscribeOrbsSpent();
		unsubscribeRank1();
		unsubscribePassiveOrbs();
		unsubscribeArea();
		timeAliveInterval();

		// On death/disconnect: accumulate area + remaining time
		const spawnTime = spawnTimes.get(playerId);

		if (spawnTime) {
			// Accumulate remaining partial-minute time alive
			const elapsed = Workspace.GetServerTimeNow() - spawnTime;
			const remainderSeconds = elapsed % 60;
			if (remainderSeconds > 0) {
				store.addLifetimeTimeAlive(playerId, math.floor(remainderSeconds));
			}
		}

		spawnTimes.delete(playerId);
		lastOrbCount.delete(playerId);
	};
}

function checkMilestoneTiers(playerId: string, category: MilestoneCategory) {
	if (!shouldGrantReward()) return;

	const categoryDef = MILESTONE_CATEGORIES.find((c) => c.id === category);
	if (!categoryDef) return;

	const progress = store.getState(selectPlayerMilestoneProgress(playerId));
	const currentTier = progress[category] ?? 0;
	const nextTier = getNextTier(categoryDef, currentTier);
	if (!nextTier) return; // All tiers complete

	const currentValue = store.getState(selectPlayerLifetimeStat(playerId, category));
	if (currentValue < nextTier.threshold) return;

	// Tier crossed! Grant rewards and advance tier.
	store.setMilestoneTier(playerId, category, currentTier + 1);

	// Grant badge if this tier has one
	if (nextTier.badge !== undefined) {
		tryGrantBadge(playerId, nextTier.badge);
	}

	const player = getPlayerByName(playerId);

	// Grant cash
	if (nextTier.cashReward > 0 && player) {
		grantMoney(player, nextTier.cashReward);
	}

	// Grant crystals
	if (nextTier.crystalReward > 0) {
		store.givePlayerCrystals(playerId, nextTier.crystalReward);
	}

	// Grant orbs (to soldier if alive, otherwise bank them)
	if (nextTier.orbReward > 0) {
		const soldier = store.getState(selectSoldierById(playerId));
		if (soldier && !soldier.dead) {
			store.incrementSoldierOrbs(playerId, nextTier.orbReward);
		} else {
			store.addBankedOrbs(playerId, nextTier.orbReward);
		}
	}

	// Alert the player
	if (player) {
		const rewardParts: string[] = [];
		if (nextTier.cashReward > 0) rewardParts.push(`$${nextTier.cashReward}`);
		if (nextTier.crystalReward > 0)
			rewardParts.push(`${nextTier.crystalReward} crystal${nextTier.crystalReward > 1 ? "s" : ""}`);
		if (nextTier.orbReward > 0) rewardParts.push(`${nextTier.orbReward} orbs`);

		remotes.client.alert.fire(player, {
			scope: "money",
			emoji: "⭐",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `Milestone: <font color="#fff">${nextTier.name}</font> — ${rewardParts.join(" + ")}!`,
			sound: assets.sounds.alert_money,
		});
	}

	// Recursively check if the next tier is also crossed (e.g., fast accumulation)
	checkMilestoneTiers(playerId, category);
}

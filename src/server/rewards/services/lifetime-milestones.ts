import { Workspace } from "@rbxts/services";
import { setInterval } from "@rbxts/set-timeout";
import { store } from "server/store";
import {
	identifyMilestone,
	selectMilestoneEliminationCount,
	selectMilestoneLastKilled,
	selectMilestoneRanking,
	selectMilestones,
} from "server/store/milestones";
import assets from "shared/assets";
import {
	getNextTier,
	getPassiveOrbRate,
	KILL_BOUNTY_CAP,
	MilestoneCategory,
	MILESTONE_CATEGORIES,
	PASSIVE_ORB_INTERVAL,
} from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import {
	selectPlayerBankedOrbs,
	selectPlayerLifetimeStat,
	selectPlayerMilestoneProgress,
} from "shared/store/saves";
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

function observeLifetimeMilestones(id: string) {
	// --- Games Played: increment on first spawn ---
	store.incrementLifetimeGamesPlayed(id);

	// --- Spawn time tracking ---
	spawnTimes.set(id, Workspace.GetServerTimeNow());

	// --- Kills: subscribe to elimination count changes ---
	let prevKills = 0;
	const unsubscribeKills = store.subscribe(selectMilestoneEliminationCount(id), (count) => {
		if (count === undefined) return;
		const delta = count - prevKills;
		if (delta > 0) {
			store.addLifetimeKills(id, delta);
			checkMilestoneTiers(id, "kills");
		}
		prevKills = count;
	});

	// --- Orbs earned: track orb increases on the soldier ---
	const unsubscribeOrbs = store.subscribe(selectSoldierOrbs(id), (orbs) => {
		if (orbs === undefined) return;
		const prev = lastOrbCount.get(id) ?? 0;
		if (orbs > prev) {
			const gained = orbs - prev;
			store.addLifetimeOrbsEarned(id, gained);
			checkMilestoneTiers(id, "orbsEarned");
		}
		lastOrbCount.set(id, orbs);
	});

	// --- Orbs spent: subscribe to milestone orbs spent ---
	let prevOrbsSpent = 0;
	const unsubscribeOrbsSpent = store.subscribe(
		(state) => state.milestones[id]?.orbsSpentOnPowerups,
		(spent) => {
			if (spent === undefined) return;
			const delta = spent - prevOrbsSpent;
			if (delta > 0) {
				store.addLifetimeOrbsSpent(id, delta);
				checkMilestoneTiers(id, "orbsSpent");
			}
			prevOrbsSpent = spent;
		},
	);

	// --- Rank 1 tracking (lifetime) ---
	let wasRank1 = false;
	const unsubscribeRank1 = store.subscribe(selectMilestoneRanking(id), (ranking) => {
		if (ranking === 1 && !wasRank1) {
			store.incrementLifetimeRank1(id);
			checkMilestoneTiers(id, "rank1");
		}
		wasRank1 = ranking === 1;
	});

	// --- Passive orb income from territory ---
	const unsubscribePassiveOrbs = store.observeWhile(
		selectSoldierById(id),
		(soldier) => soldier !== undefined && !soldier.dead,
		() => {
			return setInterval(() => {
				const soldier = store.getState(selectSoldierById(id));
				if (!soldier || soldier.dead) return;

				const orbRate = getPassiveOrbRate(soldier.polygonAreaSize);
				if (orbRate > 0) {
					store.incrementSoldierOrbs(id, orbRate);
				}
			}, PASSIVE_ORB_INTERVAL);
		},
	);

	// --- Banked orbs: deposit on spawn ---
	const banked = store.getState(selectPlayerBankedOrbs(id));
	if (banked > 0) {
		store.incrementSoldierOrbs(id, banked);
		store.consumeBankedOrbs(id);

		const player = getPlayerByName(id);
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
	checkMilestoneTiers(id, "gamesPlayed");

	// --- Time alive: periodic accumulation ---
	const timeAliveInterval = setInterval(() => {
		const soldier = store.getState(selectSoldierById(id));
		if (!soldier || soldier.dead) return;
		store.addLifetimeTimeAlive(id, 60);
		checkMilestoneTiers(id, "timeAlive");
	}, 60);

	return () => {
		unsubscribeKills();
		unsubscribeOrbs();
		unsubscribeOrbsSpent();
		unsubscribeRank1();
		unsubscribePassiveOrbs();
		timeAliveInterval();

		// On death/disconnect: accumulate area + remaining time
		const soldier = store.getState(selectSoldierById(id));
		const spawnTime = spawnTimes.get(id);

		if (soldier && spawnTime) {
			// Accumulate area claimed this life
			if (soldier.polygonAreaSize > 0) {
				store.addLifetimeArea(id, math.floor(soldier.polygonAreaSize));
				checkMilestoneTiers(id, "area");
			}

			// Accumulate remaining partial-minute time alive
			const elapsed = Workspace.GetServerTimeNow() - spawnTime;
			const remainderSeconds = elapsed % 60;
			if (remainderSeconds > 0) {
				store.addLifetimeTimeAlive(id, math.floor(remainderSeconds));
			}
		}

		spawnTimes.delete(id);
		lastOrbCount.delete(id);
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

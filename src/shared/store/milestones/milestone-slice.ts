import { createProducer } from "@rbxts/reflex";
import { mapProperty } from "shared/utils/object-utils";

import { KillSource, ScoreMilestone } from "./milestone-utils";
import { getMilestoneArea, MilestoneState, SCORE_MILESTONES_REVERSE } from "./milestone-utils";
import { MilestoneEntity } from "./milestone-utils";

const defaultEntity: MilestoneEntity = {
	topRank: 4,
	eliminationCount: 0,
	botKillCount: 0,
	candyCollected: 0,
	orbsSpentOnPowerups: 0,
	powerupsUsed: [],
	headOnVictory: false,
	giantSlain: false,
	towerDestroyed: false,
	shieldBlockedDeath: false,
	lastDamageAt: 0,
	reviveCount: 0,
	rank1Count: 0,
	rank1Since: 0,
};

const initialState: MilestoneState = {};

export const milestoneSlice = createProducer(initialState, {
	addMilestone: (state, playerId: string) => ({
		...state,
		[playerId]: {
			...defaultEntity,
			// Preserve session-level fields if they existed before
			reviveCount: state[playerId]?.reviveCount ?? 0,
			rank1Count: state[playerId]?.rank1Count ?? 0,
		},
	}),

	removeMilestone: (state, playerId: string) => {
		const existing = state[playerId];
		if (!existing) {
			return { ...state, [playerId]: undefined };
		}
		// Keep session-level fields by not fully removing
		return {
			...state,
			[playerId]: {
				...defaultEntity,
				reviveCount: existing.reviveCount,
				rank1Count: existing.rank1Count,
			},
		};
	},

	clearMilestoneKillScore: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			lastKilled: undefined,
		}));
	},

	setMilestoneRank: (state, playerId: string, ranking: number) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			topRank: math.min(ranking, milestone.topRank),
		}));
	},

	setMilestoneArea: (state, playerId: string, currentArea: number) => {
		return mapProperty(state, playerId, (milestone) => {
			const currentMilestone = getMilestoneArea(currentArea);

			print(`${playerId} area=${currentArea}`, milestone.topArea, currentMilestone, SCORE_MILESTONES_REVERSE);

			const topMilestone = math.max(currentMilestone || 0, milestone.topArea || 0);

			if (topMilestone === 0) {
				return milestone;
			}

			warn(`${playerId} topArea=${topMilestone}`);

			return {
				...milestone,
				topArea: topMilestone as ScoreMilestone,
			};
		});
	},

	playerKilledSoldier: (state, playerId: string, lastKilled: string, killSource?: KillSource) => {
		const milestone = state[playerId] ?? defaultEntity;
		const isSelfKill = playerId === lastKilled;
		const isBot = string.sub(lastKilled, 1, 4) === "BOT_";
		return {
			...state,
			[playerId]: {
				...milestone,
				lastKilled,
				lastKillSource: killSource,
				eliminationCount: isSelfKill ? milestone.eliminationCount : milestone.eliminationCount + 1,
				botKillCount: isBot && !isSelfKill ? milestone.botKillCount + 1 : milestone.botKillCount,
			},
		};
	},

	setMilestoneHeadOnVictory: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			headOnVictory: true,
		}));
	},

	setMilestoneGiantSlain: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			giantSlain: true,
		}));
	},

	incrementMilestoneCandyCollected: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			candyCollected: milestone.candyCollected + 1,
		}));
	},

	addMilestoneOrbsSpent: (state, playerId: string, amount: number) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			orbsSpentOnPowerups: milestone.orbsSpentOnPowerups + amount,
		}));
	},

	addMilestonePowerupUsed: (state, playerId: string, powerupId: string) => {
		return mapProperty(state, playerId, (milestone) => {
			if (milestone.powerupsUsed.includes(powerupId)) {
				return milestone;
			}
			return {
				...milestone,
				powerupsUsed: [...milestone.powerupsUsed, powerupId],
			};
		});
	},

	setMilestoneTowerDestroyed: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			towerDestroyed: true,
		}));
	},

	setMilestoneShieldBlockedDeath: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			shieldBlockedDeath: true,
		}));
	},

	setMilestoneLastDamageAt: (state, playerId: string, time: number) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			lastDamageAt: time,
		}));
	},

	incrementMilestoneReviveCount: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			reviveCount: milestone.reviveCount + 1,
		}));
	},

	incrementMilestoneRank1Count: (state, playerId: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			rank1Count: milestone.rank1Count + 1,
		}));
	},

	setMilestoneRank1Since: (state, playerId: string, time: number) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			rank1Since: time,
		}));
	},
});

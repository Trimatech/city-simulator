import { createProducer } from "@rbxts/reflex";
import { DEFAULT_MILESTONE_PROGRESS, MilestoneCategory } from "shared/constants/lifetime-milestones";
import { mapProperty } from "shared/utils/object-utils";

import { PlayerSave } from "./save-types";

export interface SaveState {
	readonly [id: string]: PlayerSave | undefined;
}

const initialState: SaveState = {};

export const saveSlice = createProducer(initialState, {
	setPlayerSave: (state, player: string, save: PlayerSave) => ({
		...state,
		[player]: save,
	}),

	deletePlayerSave: (state, player: string) => ({
		...state,
		[player]: undefined,
	}),

	patchPlayerSave: (state, player: string, patch: Partial<PlayerSave>) => {
		return mapProperty(state, player, (save) => ({
			...save,
			...patch,
		}));
	},

	givePlayerBalance: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			balance: math.max(save.balance + amount, 0),
		}));
	},

	spendPlayerCrystals: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			crystals: math.max((save.crystals ?? 0) - amount, 0),
		}));
	},

	givePlayerCrystals: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			crystals: (save.crystals ?? 0) + math.max(amount, 0),
		}));
	},

	givePlayerSkin: (state, player: string, skin: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			skins: [...save.skins, skin],
		}));
	},

	setPlayerSkin: (state, player: string, skin: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			skin,
		}));
	},

	claimDailyReward: (state, player: string, streak: number, crystals: number, claimTime: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			dailyStreak: streak,
			lastDailyRewardClaim: claimTime,
			crystals: (save.crystals ?? 0) + math.max(crystals, 0),
		}));
	},

	// Lifetime stat increments
	addLifetimeKills: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeKills: (save.lifetimeKills ?? 0) + amount,
		}));
	},

	addLifetimeArea: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeAreaClaimed: (save.lifetimeAreaClaimed ?? 0) + amount,
		}));
	},

	addLifetimeOrbsEarned: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeOrbsEarned: (save.lifetimeOrbsEarned ?? 0) + amount,
		}));
	},

	addLifetimeTimeAlive: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeTimeAlive: (save.lifetimeTimeAlive ?? 0) + amount,
		}));
	},

	incrementLifetimeRank1: (state, player: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeRank1Count: (save.lifetimeRank1Count ?? 0) + 1,
		}));
	},

	addLifetimeOrbsSpent: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeOrbsSpent: (save.lifetimeOrbsSpent ?? 0) + amount,
		}));
	},

	incrementLifetimeGamesPlayed: (state, player: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeGamesPlayed: (save.lifetimeGamesPlayed ?? 0) + 1,
		}));
	},

	setMilestoneTier: (state, player: string, category: MilestoneCategory, tier: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			milestoneProgress: {
				...(save.milestoneProgress ?? DEFAULT_MILESTONE_PROGRESS),
				[category]: tier,
			},
		}));
	},

	addBankedOrbs: (state, player: string, amount: number) => {
		return mapProperty(state, player, (save) => ({
			...save,
			bankedOrbs: (save.bankedOrbs ?? 0) + amount,
		}));
	},

	consumeBankedOrbs: (state, player: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			bankedOrbs: 0,
		}));
	},

	performAscension: (state, player: string) => {
		return mapProperty(state, player, (save) => ({
			...save,
			lifetimeKills: 0,
			lifetimeAreaClaimed: 0,
			lifetimeOrbsEarned: 0,
			lifetimeTimeAlive: 0,
			lifetimeRank1Count: 0,
			lifetimeOrbsSpent: 0,
			lifetimeGamesPlayed: 0,
			milestoneProgress: { ...DEFAULT_MILESTONE_PROGRESS },
			ascensionLevel: (save.ascensionLevel ?? 0) + 1,
		}));
	},
});

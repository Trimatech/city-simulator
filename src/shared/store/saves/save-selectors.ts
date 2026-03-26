import { DEFAULT_MILESTONE_PROGRESS, MilestoneCategory } from "shared/constants/lifetime-milestones";
import { SharedState } from "..";

export const selectPlayerSaves = (state: SharedState) => {
	return state.saves;
};

export const selectPlayerSave = (id: string) => {
	return (state: SharedState) => state.saves[id];
};

export const selectPlayerBalance = (id: string) => {
	return (state: SharedState) => state.saves[id]?.balance;
};

export const selectPlayerCrystals = (id: string) => {
	return (state: SharedState) => state.saves[id]?.crystals ?? 0;
};

export const selectPlayerSkins = (id: string) => {
	return (state: SharedState) => state.saves[id]?.skins;
};

export const selectCurrentPlayerSkin = (id: string) => {
	return (state: SharedState) => state.saves[id]?.skin;
};

export const selectPlayerOwnsSkin = (id: string, skinId: string) => {
	return (state: SharedState) => state.saves[id]?.skins.includes(skinId);
};

export const selectPlayerEquippedSkin = (id: string, skinId: string) => {
	return (state: SharedState) => state.saves[id]?.skin === skinId;
};

export const selectPlayerDailyStreak = (id: string) => {
	return (state: SharedState) => state.saves[id]?.dailyStreak ?? 0;
};

export const selectPlayerLastDailyRewardClaim = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lastDailyRewardClaim ?? 0;
};

// Lifetime stats selectors
export const selectPlayerLifetimeKills = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeKills ?? 0;
};

export const selectPlayerLifetimeArea = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeAreaClaimed ?? 0;
};

export const selectPlayerLifetimeOrbsEarned = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeOrbsEarned ?? 0;
};

export const selectPlayerLifetimeTimeAlive = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeTimeAlive ?? 0;
};

export const selectPlayerLifetimeRank1 = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeRank1Count ?? 0;
};

export const selectPlayerLifetimeOrbsSpent = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeOrbsSpent ?? 0;
};

export const selectPlayerLifetimeGamesPlayed = (id: string) => {
	return (state: SharedState) => state.saves[id]?.lifetimeGamesPlayed ?? 0;
};

export const selectPlayerMilestoneProgress = (id: string) => {
	return (state: SharedState) => state.saves[id]?.milestoneProgress ?? DEFAULT_MILESTONE_PROGRESS;
};

export const selectPlayerMilestoneTier = (id: string, category: MilestoneCategory) => {
	return (state: SharedState) => state.saves[id]?.milestoneProgress?.[category] ?? 0;
};

export const selectPlayerBankedOrbs = (id: string) => {
	return (state: SharedState) => state.saves[id]?.bankedOrbs ?? 0;
};

export const selectPlayerAscensionLevel = (id: string) => {
	return (state: SharedState) => state.saves[id]?.ascensionLevel ?? 0;
};

/** Get the lifetime stat value for a given milestone category. */
export function selectPlayerLifetimeStat(id: string, category: MilestoneCategory) {
	return (state: SharedState) => {
		const save = state.saves[id];
		if (!save) return 0;
		switch (category) {
			case "kills":
				return save.lifetimeKills ?? 0;
			case "area":
				return save.lifetimeAreaClaimed ?? 0;
			case "orbsEarned":
				return save.lifetimeOrbsEarned ?? 0;
			case "timeAlive":
				return save.lifetimeTimeAlive ?? 0;
			case "rank1":
				return save.lifetimeRank1Count ?? 0;
			case "orbsSpent":
				return save.lifetimeOrbsSpent ?? 0;
			case "gamesPlayed":
				return save.lifetimeGamesPlayed ?? 0;
		}
	};
}

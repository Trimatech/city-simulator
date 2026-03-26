import { SharedState } from "shared/store";

import { MilestoneEntity } from "./milestone-utils";

export const identifyMilestone = (_milestone: MilestoneEntity, index: string) => {
	return index;
};

export const selectMilestones = (state: SharedState) => {
	return state.milestones;
};

export const selectMilestone = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId];
	};
};

export const selectMilestoneRanking = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.topRank;
	};
};

export const selectMilestoneArea = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.topArea;
	};
};

export const selectMilestoneLastKilled = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.lastKilled;
	};
};

export const selectMilestoneEliminationCount = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.eliminationCount;
	};
};

export const selectMilestoneBotKillCount = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.botKillCount;
	};
};

export const selectMilestoneCandyCollected = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.candyCollected;
	};
};

export const selectMilestoneOrbsSpent = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.orbsSpentOnPowerups;
	};
};

export const selectMilestonePowerupsUsed = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.powerupsUsed;
	};
};

export const selectMilestoneHeadOnVictory = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.headOnVictory;
	};
};

export const selectMilestoneGiantSlain = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.giantSlain;
	};
};

export const selectMilestoneTowerDestroyed = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.towerDestroyed;
	};
};

export const selectMilestoneShieldBlockedDeath = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.shieldBlockedDeath;
	};
};

export const selectMilestoneReviveCount = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.reviveCount;
	};
};

export const selectMilestoneRank1Count = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.rank1Count;
	};
};

export const selectMilestoneRank1Since = (playerId: string) => {
	return (state: SharedState) => {
		return state.milestones[playerId]?.rank1Since;
	};
};

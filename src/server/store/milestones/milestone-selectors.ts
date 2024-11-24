import { RootState } from "..";
import { MilestoneEntity } from "./milestone-utils";

export const identifyMilestone = (milestone: MilestoneEntity, index: string) => {
	return index;
};

export const selectMilestones = (state: RootState) => {
	return state.milestones;
};

export const selectMilestone = (playerId: string) => {
	return (state: RootState) => {
		return state.milestones[playerId];
	};
};

export const selectMilestoneRanking = (playerId: string) => {
	return (state: RootState) => {
		return state.milestones[playerId]?.topRank;
	};
};

export const selectMilestoneArea = (playerId: string) => {
	return (state: RootState) => {
		return state.milestones[playerId]?.topArea;
	};
};

export const selectMilestoneLastKilled = (playerId: string) => {
	return (state: RootState) => {
		return state.milestones[playerId]?.lastKilled;
	};
};

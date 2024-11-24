import { createProducer } from "@rbxts/reflex";
import { mapProperty } from "shared/utils/object-utils";

import { ScoreMilestone } from "./milestone-utils";
import { getMilestoneArea, MilestoneState, SCORE_MILESTONES_REVERSE } from "./milestone-utils";
import { MilestoneEntity } from "./milestone-utils";

const defaultEntity: MilestoneEntity = {
	topRank: 4,
};

const initialState: MilestoneState = {};

export const milestoneSlice = createProducer(initialState, {
	addMilestone: (state, playerId: string) => ({
		...state,
		[playerId]: { ...defaultEntity },
	}),

	removeMilestone: (state, playerId: string) => ({
		...state,
		[playerId]: undefined,
	}),

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

	playerKilledSoldier: (state, playerId: string, lastKilled: string) => {
		return mapProperty(state, playerId, (milestone) => ({
			...milestone,
			lastKilled,
		}));
	},
});

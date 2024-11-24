import { store } from "server/store";
import {
	identifySoldier,
	selectPlayerSoldiersById,
	selectSoldierArea,
	selectSoldierRanking,
} from "shared/store/soldiers";

import { shouldGrantReward } from "../utils";

export function initMilestoneService() {
	store.observe(selectPlayerSoldiersById, identifySoldier, (soldier) => {
		return observePlayer(soldier.id);
	});
}

function observePlayer(id: string) {
	const unsubscribeRanking = store.subscribe(selectSoldierRanking(id), (ranking) => {
		if (ranking !== undefined && shouldGrantReward()) {
			store.setMilestoneRank(id, ranking);
		}
	});

	const unsubscribeArea = store.subscribe(selectSoldierArea(id), (area) => {
		if (area !== undefined && shouldGrantReward()) {
			store.setMilestoneArea(id, area);
		}
	});

	store.addMilestone(id);

	return () => {
		unsubscribeRanking();
		unsubscribeArea();
		store.removeMilestone(id);
	};
}

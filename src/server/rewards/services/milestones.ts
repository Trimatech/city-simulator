import { store } from "server/store";
import { identifySoldier, selectPlayerSoldiersById, selectSoldierRanking, selectSoldierscore } from "shared/store/soldiers";

import { shouldGrantReward } from "../utils";

export async function initMilestoneService() {
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

	const unsubscribeScore = store.subscribe(selectSoldierscore(id), (score) => {
		if (score !== undefined && shouldGrantReward()) {
			store.setMilestoneScore(id, score);
		}
	});

	store.addMilestone(id);

	return () => {
		unsubscribeRanking();
		unsubscribeScore();
		store.removeMilestone(id);
	};
}

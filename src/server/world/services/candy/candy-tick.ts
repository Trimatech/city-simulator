import { store } from "server/store";
import { getCandy } from "server/world/utils";
import { describeSoldierFromScore, selectSoldiersById } from "shared/store/soldiers";

import { candyGrid, eatCandy } from "./candy-helpers";

export function onCandyTick() {
	const soldiers = store.getState(selectSoldiersById);

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) {
			continue;
		}

		const range = describeSoldierFromScore(soldier.score).radius * 1.25 + 1;

		const nearest = candyGrid.nearest(soldier.position, range, (point) => {
			const candy = getCandy(point.metadata.id);
			return candy !== undefined && !candy.eatenAt;
		});

		if (nearest) {
			eatCandy(nearest.metadata.id, soldier.id);
		}
	}
}

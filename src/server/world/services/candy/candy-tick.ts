import { store } from "server/store";
import { getCandy } from "server/world/world.utils";
import { selectSoldiersById, SOLDIER_EAT_RADIUS } from "shared/store/soldiers";

import { candyGrid, eatCandy } from "./candy-utils";

export function onCandyTick() {
	const soldiers = store.getState(selectSoldiersById);

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) {
			continue;
		}

		try {
			const range = SOLDIER_EAT_RADIUS;

			const nearest = candyGrid.nearest(soldier.position, range, (point) => {
				const candy = getCandy(point.metadata.id);
				return candy !== undefined && !candy.eatenAt;
			});

			if (nearest) {
				eatCandy(nearest.metadata.id, soldier.id);
				store.incrementMilestoneCandyCollected(soldier.id);
			}
		} catch (err) {
			warn(`[Candy] tick failed for soldier ${soldier.id}:`, err);
		}
	}
}

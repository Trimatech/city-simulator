import { store } from "server/store";
import { selectSoldiersById } from "shared/store/soldiers";
import { Grid } from "shared/utils/grid";

export const soldierGrid = new Grid<{ id: string }>(10);

export function updateSoldierGrid() {
	const soldiers = store.getState(selectSoldiersById);

	soldierGrid.clear();

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) {
			continue;
		}

		soldierGrid.insert(soldier.position, { id: soldier.id });

		for (const tracer of soldier.tracers) {
			soldierGrid.insert(tracer, { id: soldier.id });
		}
	}
}

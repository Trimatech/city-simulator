import { store } from "server/store";
import { selectSoldiersById } from "shared/store/soldiers";
import { filterTracersForCell } from "shared/utils/geometry-utils";
import { Grid } from "shared/utils/grid";

export const soldierGrid = new Grid<{ id: string; tracers?: Vector2[] }>(10);

export function updateSoldierGrid() {
	const soldiers = store.getState(selectSoldiersById);

	soldierGrid.clear();

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) {
			continue;
		}
		const allTracers = [...soldier.tracers];

		const tracersAtHeadCell = filterTracersForCell(allTracers, soldier.position, soldierGrid.resolution);
		soldierGrid.insert(soldier.position, {
			id: soldier.id,
			tracers: tracersAtHeadCell.size() >= 2 ? tracersAtHeadCell : undefined,
		});

		for (const tracerPosition of allTracers) {
			const tracersAtCell = filterTracersForCell(allTracers, tracerPosition, soldierGrid.resolution);
			soldierGrid.insert(tracerPosition, {
				id: soldier.id,
				tracers: tracersAtCell.size() >= 2 ? tracersAtCell : undefined,
			});
		}
	}
}

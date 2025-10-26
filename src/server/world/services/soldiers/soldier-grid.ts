import { store } from "server/store";
import { selectGridResolution } from "shared/store/grid/grid-slice";
import { selectSoldiersById } from "shared/store/soldiers";
import { filterTracersForCell } from "shared/utils/geometry-utils";
import { Grid } from "shared/utils/grid";

// Local debug/visualization grid (kept for soldier-grid-visualizer)
export const soldierGrid = new Grid<{ id: string; tracers?: Vector2[] }>(10);

// Build per-tick tracer lines per cell and dispatch diffs into shared grid slice

export function updateSoldierGrid() {
	const state = store.getState();
	const soldiers = selectSoldiersById(state);
	const resolution = selectGridResolution({ grid: state.grid });

	// Maintain debug grid contents for visualizer
	soldierGrid.clear();

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) continue;
		const tracers = [...soldier.tracers] as Vector2[];
		if (!tracers || tracers.size() < 2) continue;

		// Populate debug grid near head cell
		const tracersAtHeadCell = filterTracersForCell(tracers, soldier.position, soldierGrid.resolution);
		soldierGrid.insert(soldier.position, {
			id: soldier.id,
			tracers: tracersAtHeadCell.size() >= 2 ? tracersAtHeadCell : undefined,
		});

		for (const tracerPosition of tracers) {
			const tracersAtCell = filterTracersForCell(tracers, tracerPosition, soldierGrid.resolution);
			soldierGrid.insert(tracerPosition, {
				id: soldier.id,
				tracers: tracersAtCell.size() >= 2 ? tracersAtCell : undefined,
			});
		}
	}
}

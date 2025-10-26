import { store } from "server/store";
import { selectGridCells, selectGridResolution } from "shared/store/grid/grid-selectors";
import { selectSoldiersById } from "shared/store/soldiers";
import { filterTracersForCell } from "shared/utils/geometry-utils";
import { Grid } from "shared/utils/grid";
import {
	buildMergedCellContentUnionKind,
	buildTracerLinesByCell,
	computeCellsFromNew,
	shallowEqualCell,
} from "shared/utils/grid-lines.utils";

// Local debug/visualization grid (kept for soldier-grid-visualizer)
export const soldierGrid = new Grid<{ id: string; tracers?: Vector2[] }>(10);

// Build per-tick tracer lines per cell and dispatch diffs into shared grid slice

export function updateTracerGridForOwner({ ownerId, positions }: { ownerId: string; positions: Vector2[] }) {
	const state = store.getState();
	const resolution = selectGridResolution({ grid: state.grid });
	const linesByCell = buildTracerLinesByCell(positions, resolution, ownerId);
	const currentCells = selectGridCells({ grid: state.grid });
	// Only touch cells that have new tracer segments; never delete existing ones here
	const affected = computeCellsFromNew(linesByCell);
	affected.forEach((cellKey) => {
		const existing = currentCells[cellKey];
		const newLines = linesByCell.get(cellKey);
		const merged = buildMergedCellContentUnionKind(existing, newLines, ownerId, "tracer");
		if (!shallowEqualCell(existing, merged)) {
			store.setCellLines(cellKey, merged);
		}
	});
}

export function updateSoldierGrid() {
	const state = store.getState();
	const soldiers = selectSoldiersById(state);

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

		// Emit tracer lines into grid slice with upstream diffing
		const positions = tracersAtHeadCell.size() >= 2 ? tracersAtHeadCell : tracers;
		updateTracerGridForOwner({ ownerId: soldier.id, positions });
	}
}

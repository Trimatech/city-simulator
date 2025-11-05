import { store } from "server/store";
import { createParallelPolygon } from "shared/polygon.utils";
import { selectGridCells, selectGridResolution } from "shared/store/grid/grid-selectors";
import type { GridLine } from "shared/store/grid/grid-types";
import { selectSoldiersById } from "shared/store/soldiers";
import { filterTracersForCell } from "shared/utils/geometry-utils";
import { Grid } from "shared/utils/grid";
import {
	buildAreaLinesByCell,
	buildMergedCellContent,
	buildMergedCellContentReplaceKind,
	buildMergedCellContentUnionKind,
	buildTracerLinesByCell,
	computeAffectedCells,
	computeCellsFromNew,
	shallowEqualCell,
} from "shared/utils/grid-lines.utils";

// Local debug/visualization grid (kept for soldier-grid-visualizer)
export const soldierGrid = new Grid<{ id: string; tracers?: Vector2[] }>(20);

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

	// Publish the soldier's last tracer point for client rendering
	if (positions.size() >= 1) {
		const last = positions[positions.size() - 1];
		store.setSoldierLastTracerPoint(ownerId, last);
	} else {
		store.setSoldierLastTracerPoint(ownerId, undefined);
	}
}

export function updateSoldierGrid() {
	const state = store.getState();
	const soldiers = selectSoldiersById(state);

	// Maintain debug grid contents for visualizer
	soldierGrid.clear();

	for (const [, soldier] of pairs(soldiers)) {
		if (soldier.dead) continue;
		const tracers = [...soldier.tracers] as Vector2[];
		if (!tracers) continue;

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

		// Emit tracer lines based on the full, authoritative tracer list
		const positions = tracers;
		updateTracerGridForOwner({ ownerId: soldier.id, positions });
	}
}

// Update area lines for a polygon owner across grid cells, with optional tracer dropping
export function updateAreaGridForPolygon({
	ownerId,
	polygon,
	dropTracers = true,
}: {
	ownerId: string;
	polygon: Vector2[];
	dropTracers?: boolean;
}) {
	// Do not write grid lines for dead or missing owners to avoid re-adding walls after death
	const soldiersById = selectSoldiersById(store.getState());
	const owner = soldiersById[ownerId];
	if (!owner || owner.dead) {
		warn(`updateAreaGridForPolygon: owner ${ownerId} is dead or missing`);
		return;
	}
	const state = store.getState();
	const resolution = selectGridResolution({ grid: state.grid });

	// Build outer area lines (original polygon)
	const areaLinesByCell = buildAreaLinesByCell(polygon, resolution, "area");

	// Build inner area2 lines (1 stud smaller) if polygon is valid
	let area2LinesByCell = new Map<string, Map<string, GridLine>>();
	if (polygon.size() >= 3) {
		const inner = createParallelPolygon(polygon, 1);
		if (inner.size() >= 3) {
			area2LinesByCell = buildAreaLinesByCell(inner, resolution, "area2");
		}
	}

	// Merge area and area2 lines per cell
	const combinedLinesByCell = new Map<string, Map<string, GridLine>>();
	areaLinesByCell.forEach((map, key) => {
		const clone = new Map<string, GridLine>();
		map.forEach((v, k) => clone.set(k, v));
		combinedLinesByCell.set(key, clone);
	});
	area2LinesByCell.forEach((map, key) => {
		let target = combinedLinesByCell.get(key);
		if (!target) {
			target = new Map();
			combinedLinesByCell.set(key, target);
		}
		map.forEach((v, k) => target!.set(k, v));
	});
	const currentCells = selectGridCells({ grid: state.grid });
	const affectedCells = computeAffectedCells(currentCells, combinedLinesByCell, ownerId);

	affectedCells.forEach((cellKey) => {
		const existing = currentCells[cellKey];
		const newLines = combinedLinesByCell.get(cellKey);
		let base = dropTracers
			? buildMergedCellContentReplaceKind(existing, undefined, ownerId, "tracer")
			: (existing as typeof existing);
		// Ensure previous area2 lines by this owner are also removed before adding new ones
		base = buildMergedCellContentReplaceKind(base, undefined, ownerId, "area");
		base = buildMergedCellContentReplaceKind(base, undefined, ownerId, "area2");
		const merged = buildMergedCellContent(base, newLines, ownerId);
		if (!shallowEqualCell(existing, merged)) {
			store.setCellLines(cellKey, merged);
		}
	});
}

// Remove all grid lines (area and tracer) belonging to an owner across all cells
export function clearOwnerFromGrid(ownerId: string) {
	const state = store.getState();
	const currentCells = selectGridCells({ grid: state.grid });

	for (const [cellKey, existing] of pairs(currentCells)) {
		if (!existing) continue;
		// Remove area and area2 lines by owner
		let cleaned = buildMergedCellContentReplaceKind(existing, undefined, ownerId, "area");
		cleaned = buildMergedCellContentReplaceKind(cleaned, undefined, ownerId, "area2");
		// Then remove tracer lines by owner
		const noOwner = buildMergedCellContentReplaceKind(cleaned, undefined, ownerId, "tracer");
		if (!shallowEqualCell(existing, noOwner)) {
			store.setCellLines(cellKey as string, noOwner);
		}
	}
}

// Remove only tracer lines belonging to an owner across all cells
export function clearOwnerTracersFromGrid(ownerId: string) {
	const state = store.getState();
	const currentCells = selectGridCells({ grid: state.grid });

	for (const [cellKey, existing] of pairs(currentCells)) {
		if (!existing) continue;
		const noTracers = buildMergedCellContentReplaceKind(existing, undefined, ownerId, "tracer");
		if (!shallowEqualCell(existing, noTracers)) {
			store.setCellLines(cellKey as string, noTracers);
		}
	}
}

import { store } from "server/store";
import { selectGridCells, selectGridResolution } from "shared/store/grid/grid-selectors";
import { selectSoldiersById } from "shared/store/soldiers";
import { getCellCoordFromPos, getCellKeyFromCoord } from "shared/utils/cell-key";
import { getEdgeId, quantizeVector2 } from "shared/utils/edge-id";
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
	getCompoundEdgeKey,
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

	// Update the soldier's last tracer reference to the final segment in positions
	if (positions.size() >= 2) {
		const a = positions[positions.size() - 2];
		const b = positions[positions.size() - 1];
		const quantQ = math.max(0.1, resolution / 10);
		const qa = quantizeVector2(a, quantQ);
		const qb = quantizeVector2(b, quantQ);
		const edgeId = getEdgeId({ a: qa, b: qb });
		const mid = new Vector2((qa.X + qb.X) / 2, (qa.Y + qb.Y) / 2);
		const coord = getCellCoordFromPos(mid, resolution);
		const cellKey = getCellKeyFromCoord(coord);
		const compound = getCompoundEdgeKey(edgeId, ownerId, "tracer");
		store.setSoldierLastTracerRef(ownerId, cellKey, compound);
	} else {
		store.setSoldierLastTracerRef(ownerId, undefined, undefined);
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
	const state = store.getState();
	const resolution = selectGridResolution({ grid: state.grid });
	const areaLinesByCell = buildAreaLinesByCell(polygon, resolution);
	const currentCells = selectGridCells({ grid: state.grid });
	const affectedCells = computeAffectedCells(currentCells, areaLinesByCell, ownerId);

	affectedCells.forEach((cellKey) => {
		const existing = currentCells[cellKey];
		const newLines = areaLinesByCell.get(cellKey);
		const base = dropTracers
			? buildMergedCellContentReplaceKind(existing, undefined, ownerId, "tracer")
			: (existing as typeof existing);
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
		// Remove area lines by owner
		const noArea = buildMergedCellContentReplaceKind(existing, undefined, ownerId, "area");
		// Then remove tracer lines by owner
		const noOwner = buildMergedCellContentReplaceKind(noArea, undefined, ownerId, "tracer");
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

import { GridCellsByEdgeId, GridLine } from "shared/store/grid/grid-slice";
import { getCellAABBFromCoord, getCellCoordFromPos, getCellKeyFromCoord } from "shared/utils/cell-key";
import { getEdgeId, quantizeVector2 } from "shared/utils/edge-id";
import { segmentIntersectsRect } from "shared/utils/geometry-utils";

export function shallowEqualCell(a?: GridCellsByEdgeId, b?: GridCellsByEdgeId) {
	if (a === b) return true;
	if (!a || !b) return false;
	let countA = 0;
	for (const [id, line] of pairs(a)) {
		countA++;
		const other = b[id as string];
		if (!other) return false;
		if (other.kind !== line!.kind || other.ownerId !== line!.ownerId) return false;
		const idA = getEdgeId({ a: line!.a, b: line!.b });
		const idB = getEdgeId({ a: other.a, b: other.b });
		if (idA !== idB) return false;
	}
	let countB = 0;
	for (const [,] of pairs(b)) countB++;
	return countA === countB;
}

export function buildAreaLinesByCell(points: Vector2[], resolution: number) {
	const areaLinesByCell = new Map<string, Map<string, GridLine>>();
	const quantQ = math.max(0.1, resolution / 10);

	for (let i = 0; i < points.size(); i++) {
		const a = points[i];
		const b = points[i + 1] || points[0];

		const minX = math.min(a.X, b.X);
		const maxX = math.max(a.X, b.X);
		const minY = math.min(a.Y, b.Y);
		const maxY = math.max(a.Y, b.Y);
		const minC = getCellCoordFromPos(new Vector2(minX, minY), resolution);
		const maxC = getCellCoordFromPos(new Vector2(maxX, maxY), resolution);

		for (const ix of $range(minC.X, maxC.X)) {
			for (const iy of $range(minC.Y, maxC.Y)) {
				const key = getCellKeyFromCoord(new Vector2(ix, iy));
				const [cellMin, cellMax] = getCellAABBFromCoord(new Vector2(ix, iy), resolution);
				if (!segmentIntersectsRect(a, b, cellMin.X, cellMin.Y, cellMax.X, cellMax.Y)) continue;

				let cell = areaLinesByCell.get(key);
				if (!cell) {
					cell = new Map<string, GridLine>();
					areaLinesByCell.set(key, cell);
				}
				const qa = quantizeVector2(a, quantQ);
				const qb = quantizeVector2(b, quantQ);
				const edgeId = getEdgeId({ a: qa, b: qb });
				cell.set(edgeId, { a: qa, b: qb, ownerId: "", kind: "area" });
			}
		}
	}

	return areaLinesByCell;
}

export function computeAffectedCells(
	currentCells: { readonly [cellKey: string]: GridCellsByEdgeId | undefined },
	areaLinesByCell: Map<string, Map<string, GridLine>>,
	ownerId: string,
) {
	const affected = new Set<string>();
	areaLinesByCell.forEach((_, key) => affected.add(key));
	for (const [cellKey, existing] of pairs(currentCells)) {
		if (!existing) continue;
		for (const [, line] of pairs(existing)) {
			if (line && line.kind === "area" && line.ownerId === ownerId) {
				affected.add(cellKey as string);
				break;
			}
		}
	}
	return affected;
}

export function buildMergedCellContent(
	existing: GridCellsByEdgeId | undefined,
	newLines: Map<string, GridLine> | undefined,
	ownerId: string,
): GridCellsByEdgeId {
	const merged: Record<string, GridLine> = {};
	if (existing) {
		for (const [eid, line] of pairs(existing)) {
			if (!line) continue;
			if (line.kind === "tracer" || (line.kind === "area" && line.ownerId !== ownerId)) {
				merged[eid as string] = line;
			}
		}
	}
	if (newLines) newLines.forEach((v, k) => (merged[k] = { ...v, ownerId }));
	return merged as unknown as GridCellsByEdgeId;
}

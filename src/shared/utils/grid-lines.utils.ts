import { GridCellsByEdgeId, GridLine } from "shared/store/grid/grid-types";
import { getCellAABBFromCoord, getCellCoordFromPos, getCellKeyFromCoord } from "shared/utils/cell-key";
import { getEdgeId, quantizeVector2 } from "shared/utils/edge-id";
import { segmentIntersectsRect } from "shared/utils/geometry-utils";

// Quantization used when deriving stable edge ids for grid lines.
// Keep this relatively small to avoid collapsing nearby vertices onto the
// same coordinate (which can visually connect unrelated lines when points are
// close to cell edges). Tie it to resolution but cap with a low floor.
export function getQuantizationStep(resolution: number) {
	// Tighter quantization to avoid accidental id collisions between
	// distinct-but-nearby vertices (e.g., near cell borders).
	// Example: resolution=20 -> 0.1; resolution=10 -> 0.05
	return math.max(0.01, resolution / 200);
}

// Compound-key helpers enable multi-owner lines on the same geometric edge
export function getCompoundEdgeKey(edgeId: string, ownerId: string, kind: GridLine["kind"]) {
	return `${edgeId}#${ownerId}#${kind}`;
}

export function isCompoundEdgeKey(key: string) {
	return key.find("#") !== undefined;
}

export function shallowEqualCell(a?: GridCellsByEdgeId, b?: GridCellsByEdgeId) {
	if (a === b) return true;
	if (!a || !b) return false;
	// Compare by triples (edgeIdFromGeom, ownerId, kind) to be robust to legacy keys
	const setA = new Map<string, true>();
	for (const [, line] of pairs(a)) {
		if (!line) continue;
		const eid = getEdgeId({ a: line.a, b: line.b });
		setA.set(`${eid}|${line.ownerId}|${line.kind}`, true);
	}
	const countA = setA.size();
	let matchCount = 0;
	for (const [, line] of pairs(b)) {
		if (!line) continue;
		const eid = getEdgeId({ a: line.a, b: line.b });
		const key = `${eid}|${line.ownerId}|${line.kind}`;
		if (setA.has(key)) matchCount++;
		else return false;
	}
	return matchCount === countA;
}

export function buildAreaLinesByCell(points: Vector2[], resolution: number, kind: "area" | "area2" = "area") {
	const areaLinesByCell = new Map<string, Map<string, GridLine>>();
	const quantQ = getQuantizationStep(resolution);
	const edgeAssigned = new Set<string>();

	for (let i = 0; i < points.size(); i++) {
		const a = points[i];
		const b = points[i + 1] || points[0];

		const minX = math.min(a.X, b.X);
		const maxX = math.max(a.X, b.X);
		const minY = math.min(a.Y, b.Y);
		const maxY = math.max(a.Y, b.Y);
		const minC = getCellCoordFromPos(new Vector2(minX, minY), resolution);
		const maxC = getCellCoordFromPos(new Vector2(maxX, maxY), resolution);

		const qa = quantizeVector2(a, quantQ);
		const qb = quantizeVector2(b, quantQ);
		const edgeId = getEdgeId({ a: qa, b: qb });
		if (edgeAssigned.has(edgeId)) continue;

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
				// Store original geometry; use quantized only for stable ids
				cell.set(edgeId, { a, b, ownerId: "", kind });
				edgeAssigned.add(edgeId);
				break;
			}
		}
	}

	return areaLinesByCell;
}

function buildSegmentLinesByCell(
	segments: Vector2[],
	resolution: number,
	kind: "tracer" | "area" | "area2",
	ownerId: string,
) {
	const byCell = new Map<string, Map<string, GridLine>>();
	const quantQ = getQuantizationStep(resolution);
	const edgeAssigned = new Set<string>();

	for (let i = 0; i < segments.size() - 1; i++) {
		const a = segments[i];
		const b = segments[i + 1];

		const minX = math.min(a.X, b.X);
		const maxX = math.max(a.X, b.X);
		const minY = math.min(a.Y, b.Y);
		const maxY = math.max(a.Y, b.Y);
		const minC = getCellCoordFromPos(new Vector2(minX, minY), resolution);
		const maxC = getCellCoordFromPos(new Vector2(maxX, maxY), resolution);

		const qa = quantizeVector2(a, quantQ);
		const qb = quantizeVector2(b, quantQ);
		const edgeId = getEdgeId({ a: qa, b: qb });
		if (edgeAssigned.has(edgeId)) continue;

		for (const ix of $range(minC.X, maxC.X)) {
			for (const iy of $range(minC.Y, maxC.Y)) {
				const key = getCellKeyFromCoord(new Vector2(ix, iy));
				const [cellMin, cellMax] = getCellAABBFromCoord(new Vector2(ix, iy), resolution);
				if (!segmentIntersectsRect(a, b, cellMin.X, cellMin.Y, cellMax.X, cellMax.Y)) continue;

				let cell = byCell.get(key);
				if (!cell) {
					cell = new Map<string, GridLine>();
					byCell.set(key, cell);
				}
				// Store original geometry; use quantized only for stable ids
				cell.set(edgeId, { a, b, ownerId, kind });
				edgeAssigned.add(edgeId);
				break;
			}
		}
	}

	return byCell;
}

export function buildTracerLinesByCell(tracers: Vector2[], resolution: number, ownerId: string) {
	return buildSegmentLinesByCell(tracers, resolution, "tracer", ownerId);
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
			if (line && (line.kind === "area" || line.kind === "area2") && line.ownerId === ownerId) {
				affected.add(cellKey as string);
				break;
			}
		}
	}
	return affected;
}

export function computeAffectedCellsForKind(
	currentCells: { readonly [cellKey: string]: GridCellsByEdgeId | undefined },
	linesByCell: Map<string, Map<string, GridLine>>,
	ownerId: string,
	kind: "tracer" | "area" | "area2",
) {
	const affected = new Set<string>();
	linesByCell.forEach((_, key) => affected.add(key));
	for (const [cellKey, existing] of pairs(currentCells)) {
		if (!existing) continue;
		for (const [, line] of pairs(existing)) {
			if (line && line.kind === kind && line.ownerId === ownerId) {
				affected.add(cellKey as string);
				break;
			}
		}
	}
	return affected;
}

export function computeCellsFromNew(linesByCell: Map<string, Map<string, GridLine>>) {
	const affected = new Set<string>();
	linesByCell.forEach((_, key) => affected.add(key));
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
			// Keep all tracer lines; keep area/area2 lines not owned by the current owner
			if (
				line.kind === "tracer" ||
				((line.kind === "area" || line.kind === "area2") && line.ownerId !== ownerId)
			) {
				merged[eid as string] = line;
			}
			// Drop legacy non-compound area entries for this owner to avoid duplicates
			// Will be re-added under compound key below
		}
	}
	if (newLines)
		newLines.forEach((v, k) => {
			const compound = getCompoundEdgeKey(k, ownerId, v.kind);
			merged[compound] = { ...v, ownerId };
		});
	return merged as unknown as GridCellsByEdgeId;
}

export function buildMergedCellContentReplaceKind(
	existing: GridCellsByEdgeId | undefined,
	newLines: Map<string, GridLine> | undefined,
	ownerId: string,
	kindToReplace: "tracer" | "area" | "area2",
): GridCellsByEdgeId {
	const merged: Record<string, GridLine> = {};
	if (existing) {
		for (const [eid, line] of pairs(existing)) {
			if (!line) continue;
			// Drop only this owner's lines of the kind being replaced; keep everything else
			if (!(line.kind === kindToReplace && line.ownerId === ownerId)) {
				merged[eid as string] = line;
			}
		}
	}
	if (newLines)
		newLines.forEach((v, k) => {
			const compound = getCompoundEdgeKey(k, ownerId, v.kind);
			merged[compound] = { ...v, ownerId };
		});
	return merged as unknown as GridCellsByEdgeId;
}

export function buildMergedCellContentUnionKind(
	existing: GridCellsByEdgeId | undefined,
	newLines: Map<string, GridLine> | undefined,
	ownerId: string,
	_kind: "tracer" | "area" | "area2",
): GridCellsByEdgeId {
	const merged: Record<string, GridLine> = {};
	if (existing) {
		for (const [eid, line] of pairs(existing)) {
			if (!line) continue;
			merged[eid as string] = line;
		}
	}
	if (newLines)
		newLines.forEach((v, k) => {
			const compound = getCompoundEdgeKey(k, ownerId, v.kind);
			merged[compound] = { ...v, ownerId, kind: v.kind };
		});
	return merged as unknown as GridCellsByEdgeId;
}

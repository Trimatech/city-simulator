import { isPointInPolygon } from "shared/polybool/poly-utils";
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

// function signedArea(points: Vector2[]) {
// 	let sum = 0;
// 	for (let i = 0; i < points.size(); i++) {
// 		const p = points[i];
// 		const q = points[i + 1] || points[0];
// 		sum += p.X * q.Y - q.X * p.Y;
// 	}
// 	return 0.5 * sum;
// }

// function turnSign(prev: Vector2, curr: Vector2, nextPoint: Vector2) {
// 	const v1 = curr.sub(prev);
// 	const v2 = nextPoint.sub(curr);
// 	const z = v1.X * v2.Y - v1.Y * v2.X;
// 	return z; // >0 left turn, <0 right turn
// }

function angleBetween(prev: Vector2, curr: Vector2, nextPoint: Vector2) {
	const v1 = curr.sub(prev);
	const v2 = nextPoint.sub(curr);
	if (v1.Magnitude < 1e-6 || v2.Magnitude < 1e-6) return 0;
	const dot = math.clamp(v1.Unit.Dot(v2.Unit), -1, 1);
	return math.acos(dot);
}

function computeMiterMagnitude(prev: Vector2, curr: Vector2, nextPoint: Vector2) {
	const theta = angleBetween(prev, curr, nextPoint);
	// Colinear or nearly straight
	if (theta <= 1e-3 || math.abs(theta - math.pi) <= 1e-3) return 0;

	// miterFactor = 0.5 * cot(theta/2) = 0.5 / tan(theta/2)
	const half = theta / 2;
	const t = math.tan(half);
	if (math.abs(t) < 1e-6) return 0;
	let factor = 0.5 / t;
	// Clamp to avoid extreme spikes on tiny angles
	const MAX_FACTOR = 3;
	if (factor > MAX_FACTOR) factor = MAX_FACTOR;
	return factor;
}

function rotateCW90(v: Vector2) {
	return new Vector2(v.Y, -v.X);
}

function unit(v: Vector2) {
	const m = v.Magnitude;
	if (m < 1e-6) return new Vector2(0, 0);
	return v.div(m);
}

export function buildAreaLinesByCell(points: Vector2[], resolution: number, kind: "area" | "area2" = "area") {
	const areaLinesByCell = new Map<string, Map<string, GridLine>>();
	const quantQ = getQuantizationStep(resolution);
	const asPoints = points.map((p) => [p.X, p.Y] as [number, number]);

	for (let i = 0; i < points.size(); i++) {
		const a = points[i];
		const b = points[i + 1] || points[0];
		const prev = points[i - 1] || points[points.size() - 1];
		const next2 = points[(i + 2) % points.size()];

		// Only extend outer boundary lines; inner offset (area2) uses zero
		let startMiterFactor = 0;
		let endMiterFactor = 0;
		let startNeighborDir: Vector2 | undefined = undefined;
		let endNeighborDir: Vector2 | undefined = undefined;
		if (kind === "area" || kind === "area2") {
			// Determine outward via point-in-polygon test along bisector normal
			const u1 = unit(a.sub(prev));
			const u2 = unit(b.sub(a));
			startNeighborDir = unit(prev.sub(a));
			endNeighborDir = unit(next2.sub(b));
			const n1 = rotateCW90(u1);
			const n2 = rotateCW90(u2);
			const nbStart = unit(n1.add(n2));
			const nbEnd = unit(rotateCW90(u2).add(rotateCW90(unit(next2.sub(b)))));
			const EPS = math.max(0.05, resolution / 200);
			// sample near corner
			const sampleStart = [a.X + nbStart.X * EPS, a.Y + nbStart.Y * EPS] as [number, number];
			const sampleEnd = [b.X + nbEnd.X * EPS, b.Y + nbEnd.Y * EPS] as [number, number];
			const isStartOutside = !isPointInPolygon(sampleStart, asPoints);
			const isEndOutside = !isPointInPolygon(sampleEnd, asPoints);
			startMiterFactor = isStartOutside ? computeMiterMagnitude(prev, a, b) : 0;
			endMiterFactor = isEndOutside ? computeMiterMagnitude(a, b, next2) : 0;
		}

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
				// Store original geometry; use quantized only for stable ids
				cell.set(edgeId, {
					a,
					b,
					ownerId: "",
					kind,
					startMiterFactor,
					endMiterFactor,
					startNeighborDir,
					endNeighborDir,
				});
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

	for (let i = 0; i < segments.size() - 1; i++) {
		const a = segments[i];
		const b = segments[i + 1];

		const minX = math.min(a.X, b.X);
		const maxX = math.max(a.X, b.X);
		const minY = math.min(a.Y, b.Y);
		const maxY = math.max(a.Y, b.Y);
		const minC = getCellCoordFromPos(new Vector2(minX, minY), resolution);
		const maxC = getCellCoordFromPos(new Vector2(maxX, maxY), resolution);

		const prev = segments[i - 1];
		const next2 = segments[i + 2];
		let startMiterFactor = 0;
		let endMiterFactor = 0;
		let startNeighborDir: Vector2 | undefined = undefined;
		let endNeighborDir: Vector2 | undefined = undefined;
		if (kind === "tracer") {
			if (prev !== undefined) {
				startNeighborDir = unit(prev.sub(a));
				startMiterFactor = computeMiterMagnitude(prev, a, b);
			}
			if (next2 !== undefined) {
				endNeighborDir = unit(next2.sub(b));
				endMiterFactor = computeMiterMagnitude(a, b, next2);
			}
		}

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
				const qa = quantizeVector2(a, quantQ);
				const qb = quantizeVector2(b, quantQ);
				const edgeId = getEdgeId({ a: qa, b: qb });
				// Store original geometry; use quantized only for stable ids
				cell.set(edgeId, {
					a,
					b,
					ownerId,
					kind,
					startMiterFactor,
					endMiterFactor,
					startNeighborDir,
					endNeighborDir,
				});
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

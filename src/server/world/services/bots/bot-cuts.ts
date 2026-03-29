import { store } from "server/store";
import { selectSoldierById } from "shared/store/soldiers";

/**
 * Core cut-shape generators for bot paths.
 *
 * EVERY path is a complete loop:
 *   inside polygon → exit edge → outside arc → enter edge → inside polygon
 *
 * Entry/exit points are pushed a few studs inside the polygon to guarantee
 * the tracer claim is committed before the next path starts.
 */

const INSIDE_PENETRATION = 8; // studs to push start/end inside polygon

// ─── Polygon helpers ──────────────────────────────────────────────

export function closestPointOnPolygonEdge(polygon: Vector2[], point: Vector2) {
	let bestIndex = 0;
	let bestPoint = polygon[0];
	let bestDist = math.huge;
	for (let i = 0; i < polygon.size(); i++) {
		const a = polygon[i];
		const b = polygon[(i + 1) % polygon.size()];
		const ab = b.sub(a);
		const abLenSq = ab.X * ab.X + ab.Y * ab.Y;
		if (abLenSq < 1e-6) continue;
		const t = math.clamp(point.sub(a).Dot(ab) / abLenSq, 0, 1);
		const proj = a.add(ab.mul(t));
		const d = proj.sub(point).Magnitude;
		if (d < bestDist) {
			bestDist = d;
			bestPoint = proj;
			bestIndex = i;
		}
	}
	return { point: bestPoint, edgeIndex: bestIndex };
}

function computeOutwardNormal(edgeUnit: Vector2, edgePoint: Vector2, centroid: Vector2) {
	const n1 = new Vector2(-edgeUnit.Y, edgeUnit.X);
	const n2 = new Vector2(edgeUnit.Y, -edgeUnit.X);
	return n1.Dot(edgePoint.sub(centroid)) > 0 ? n1 : n2;
}

export function getPolygonCentroid(polygon: Vector2[]): Vector2 {
	let cx = 0;
	let cy = 0;
	for (const v of polygon) {
		cx += v.X;
		cy += v.Y;
	}
	return new Vector2(cx / polygon.size(), cy / polygon.size());
}

function getEdgeUnit(polygon: Vector2[], edgeIndex: number): Vector2 {
	const a = polygon[edgeIndex];
	const b = polygon[(edgeIndex + 1) % polygon.size()];
	const v = b.sub(a);
	const len = v.Magnitude;
	return len > 1e-3 ? v.div(len) : new Vector2(1, 0);
}

function snapToPolygonEdge(polygon: Vector2[], target: Vector2): Vector2 {
	return closestPointOnPolygonEdge(polygon, target).point;
}

function pushInside(edgePoint: Vector2, centroid: Vector2, studs: number): Vector2 {
	const inward = centroid.sub(edgePoint);
	const len = inward.Magnitude;
	if (len < 1) return edgePoint;
	return edgePoint.add(inward.div(len).mul(studs));
}

/**
 * Pick an edge to start a cut from.
 * - If a direction is given, prefer edges whose outward normal aligns with it (with noise).
 * - Otherwise pick a random edge.
 * Returns a random point along the chosen edge (not always the midpoint).
 */
function pickStartingEdge(
	polygon: Vector2[],
	centroid: Vector2,
	fromPoint: Vector2,
	random: Random,
	direction?: Vector2,
): { point: Vector2; edgeIndex: number } {
	// Score every edge, then pick weighted-random (closer edges score higher)
	const scores: number[] = [];
	let totalScore = 0;

	for (let i = 0; i < polygon.size(); i++) {
		const a = polygon[i];
		const b = polygon[(i + 1) % polygon.size()];
		const mid = a.add(b).div(2);

		// Distance weight: closer edges get higher score (inverse square)
		const dist = math.max(1, mid.sub(fromPoint).Magnitude);
		let score = 1000 / (dist * dist);

		// Direction weight: if a direction is given, prefer edges whose outward normal aligns
		if (direction !== undefined) {
			const eu = getEdgeUnit(polygon, i);
			const outN = computeOutwardNormal(eu, mid, centroid);
			const alignment = outN.Dot(direction); // -1 to 1
			score *= math.max(0.1, 0.5 + alignment); // 0.1x for opposite, 1.5x for aligned
		}

		// Random noise to prevent always picking the same edge
		score *= 0.5 + random.NextNumber();

		scores.push(score);
		totalScore += score;
	}

	// Weighted random selection
	let roll = random.NextNumber() * totalScore;
	let chosenIdx = 0;
	for (let i = 0; i < scores.size(); i++) {
		roll -= scores[i];
		if (roll <= 0) {
			chosenIdx = i;
			break;
		}
	}

	const a = polygon[chosenIdx];
	const b = polygon[(chosenIdx + 1) % polygon.size()];
	const t = 0.15 + random.NextNumber() * 0.7;
	return { point: a.add(b.sub(a).mul(t)), edgeIndex: chosenIdx };
}

// ─── Path smoothing ───────────────────────────────────────────────

const MAX_WAYPOINT_GAP = 8; // studs — never let two consecutive waypoints be farther than this

/**
 * Subdivides a waypoint path so that no two consecutive points are more than
 * MAX_WAYPOINT_GAP studs apart. Inserts evenly-spaced intermediate points
 * along straight lines between any pair that exceeds the limit.
 */
function subdividePath(waypoints: Vector2[]): Vector2[] {
	if (waypoints.size() < 2) return waypoints;
	const result: Vector2[] = [waypoints[0]];

	for (let i = 1; i < waypoints.size(); i++) {
		const prev = waypoints[i - 1];
		const curr = waypoints[i];
		const gap = curr.sub(prev).Magnitude;

		if (gap > MAX_WAYPOINT_GAP) {
			const segments = math.ceil(gap / MAX_WAYPOINT_GAP);
			for (let s = 1; s < segments; s++) {
				const t = s / segments;
				result.push(prev.add(curr.sub(prev).mul(t)));
			}
		}

		result.push(curr);
	}

	return result;
}

// ─── Cut shapes ───────────────────────────────────────────────────

export interface CutOptions {
	/** Direction to bias the cut toward (e.g., toward enemy). If undefined, uses edge outward normal. */
	direction?: Vector2;
	/** How far along the polygon edge the two edge points are separated (studs). Default ~30. */
	span?: number;
	/** How far outside the polygon the cut bulges (studs). Default ~span/2 for semicircle. */
	depth?: number;
	/** Optional detour waypoint to pass through mid-cut (e.g., enemy trail). */
	detourPoint?: Vector2;
}

/**
 * Blob cut — semicircular arc, the same shape as the existing circularCut.
 * Always starts and ends a few studs INSIDE the polygon.
 */
export function buildBlobCut(botId: string, fromPoint: Vector2, options: CutOptions = {}): Vector2[] {
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier || soldier.polygon.size() < 3) return [];

	const polygon = soldier.polygon as Vector2[];
	const centroid = getPolygonCentroid(polygon);
	const random = new Random();

	// Pick starting edge — random when no direction, biased when direction given
	const { point: nearEdge, edgeIndex } = pickStartingEdge(polygon, centroid, fromPoint, random, options.direction);
	const edgeUnit = getEdgeUnit(polygon, edgeIndex);
	const outward = computeOutwardNormal(edgeUnit, nearEdge, centroid);

	// Cut direction: use provided direction or default outward
	const _cutDir = options.direction ?? outward;

	// Randomly pick which side of the edge to place exit/entry (clockwise or counter-clockwise)
	const sideSign = random.NextNumber() > 0.5 ? 1 : -1;

	// Span and depth
	const span = options.span ?? 24 + random.NextNumber() * 16; // 24-40 studs
	const depth = options.depth ?? span * (0.4 + random.NextNumber() * 0.15); // 40-55% of span

	// Two edge points separated by span
	const halfSpan = span / 2;
	const exitEdge = snapToPolygonEdge(polygon, nearEdge.add(edgeUnit.mul(halfSpan * sideSign)));
	const entryEdge = snapToPolygonEdge(polygon, nearEdge.sub(edgeUnit.mul(halfSpan * sideSign)));

	// Start/end a few studs inside polygon
	const startInside = pushInside(exitEdge, centroid, INSIDE_PENETRATION);
	const endInside = pushInside(entryEdge, centroid, INSIDE_PENETRATION);

	// Semicircle from exit to entry, bulging outward
	const chordVec = entryEdge.sub(exitEdge);
	const chordLen = chordVec.Magnitude;
	if (chordLen < 2) return [];

	const chordUnit = chordVec.div(chordLen);
	const orientation = math.atan2(chordUnit.Y, chordUnit.X);
	const arcCenter = exitEdge.add(entryEdge).div(2);
	const arcRadius = chordLen / 2;

	// Determine bulge direction (outward from polygon)
	const chordPerp = new Vector2(-chordUnit.Y, chordUnit.X);
	const bulgeSign = chordPerp.Dot(outward) >= 0 ? 1 : -1;

	// Build waypoints: fromPoint → inside → edge → arc → edge → inside
	const waypoints: Vector2[] = [];
	waypoints.push(fromPoint);
	waypoints.push(startInside);
	waypoints.push(exitEdge);

	// If we have a detour point, insert it at the arc peak
	const hasDetour = options.detourPoint !== undefined;

	const steps = 10 + math.floor(random.NextNumber() * 4);
	const wobbleAmp = 1 + random.NextNumber() * 1.5;
	const wobbleFreq = 2 + math.floor(random.NextNumber() * 2);
	const wobblePhase = random.NextNumber() * math.pi * 2;

	for (let i = 1; i < steps; i++) {
		const t = i / steps;

		// At the midpoint of the arc, optionally detour to a target
		if (hasDetour && i === math.floor(steps / 2)) {
			waypoints.push(options.detourPoint!);
			continue;
		}

		const theta = math.pi * (1 - t);
		const wobble = wobbleAmp * math.sin(wobbleFreq * theta + wobblePhase);
		const r = math.max(1, arcRadius * (depth / (chordLen / 2)) + wobble);

		const x =
			arcCenter.X +
			math.cos(theta) * arcRadius * math.cos(orientation) -
			bulgeSign * math.sin(theta) * r * math.sin(orientation);
		const y =
			arcCenter.Y +
			math.cos(theta) * arcRadius * math.sin(orientation) +
			bulgeSign * math.sin(theta) * r * math.cos(orientation);
		waypoints.push(new Vector2(x, y));
	}

	waypoints.push(entryEdge);
	waypoints.push(endInside);

	return subdividePath(waypoints);
}

/**
 * Rounded rectangle cut — exits, moves along an outward-offset path parallel to the edge,
 * then returns. Creates a wider, flatter territory claim than the blob.
 * Always starts and ends a few studs INSIDE the polygon.
 */
export function buildRectCut(botId: string, fromPoint: Vector2, options: CutOptions = {}): Vector2[] {
	const soldier = store.getState(selectSoldierById(botId));
	if (!soldier || soldier.polygon.size() < 3) return [];

	const polygon = soldier.polygon as Vector2[];
	const centroid = getPolygonCentroid(polygon);
	const random = new Random();

	// Pick starting edge — random when no direction, biased when direction given
	const { point: nearEdge, edgeIndex } = pickStartingEdge(polygon, centroid, fromPoint, random, options.direction);
	const edgeUnit = getEdgeUnit(polygon, edgeIndex);
	const outward = computeOutwardNormal(edgeUnit, nearEdge, centroid);

	const _cutDir = options.direction ?? outward;
	const sideSign = random.NextNumber() > 0.5 ? 1 : -1;

	const span = options.span ?? 30 + random.NextNumber() * 20; // 30-50 studs
	const depth = options.depth ?? 12 + random.NextNumber() * 12; // 12-24 studs outward
	const cornerRadius = 3 + random.NextNumber() * 3; // round the corners

	const halfSpan = span / 2;
	const exitEdge = snapToPolygonEdge(polygon, nearEdge.add(edgeUnit.mul(halfSpan * sideSign)));
	const entryEdge = snapToPolygonEdge(polygon, nearEdge.sub(edgeUnit.mul(halfSpan * sideSign)));

	const startInside = pushInside(exitEdge, centroid, INSIDE_PENETRATION);
	const endInside = pushInside(entryEdge, centroid, INSIDE_PENETRATION);

	// Four corners of the rectangle (outside polygon)
	const c1 = exitEdge.add(outward.mul(cornerRadius)); // just outside, near exit
	const c2 = exitEdge.add(outward.mul(depth)); // far corner, exit side
	const c3 = entryEdge.add(outward.mul(depth)); // far corner, entry side
	const c4 = entryEdge.add(outward.mul(cornerRadius)); // just outside, near entry

	const waypoints: Vector2[] = [];
	waypoints.push(fromPoint);
	waypoints.push(startInside);
	waypoints.push(exitEdge);

	// Rounded corner exit → outward
	const cornerSteps = 3;
	for (let i = 1; i <= cornerSteps; i++) {
		const t = i / (cornerSteps + 1);
		waypoints.push(c1.mul(1 - t).add(c2.mul(t)));
	}
	waypoints.push(c2);

	// Detour insertion at the far side if requested
	if (options.detourPoint !== undefined) {
		waypoints.push(options.detourPoint);
	}

	waypoints.push(c3);

	// Rounded corner inward → entry
	for (let i = 1; i <= cornerSteps; i++) {
		const t = i / (cornerSteps + 1);
		waypoints.push(c3.mul(1 - t).add(c4.mul(t)));
	}

	waypoints.push(entryEdge);
	waypoints.push(endInside);

	return subdividePath(waypoints);
}

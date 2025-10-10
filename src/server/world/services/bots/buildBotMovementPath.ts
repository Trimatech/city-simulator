import { Debris, Workspace } from "@rbxts/services";
import { store } from "server/store";
import { IS_TESTING_STUFF } from "server/world/constants";
// import { vector2ToPoint } from "shared/polybool/poly-utils";

// Helper: closest point on polygon edge to a given point
function closestPointOnPolygonEdge(polygonVectors: Vector2[], point: Vector2) {
	let bestIndex = 0;
	let bestPoint = polygonVectors[0];
	let bestDistance = math.huge;
	for (let i = 0; i < polygonVectors.size(); i++) {
		const a = polygonVectors[i];
		const b = polygonVectors[(i + 1) % polygonVectors.size()];
		const ab = b.sub(a);
		const abLenSq = ab.X * ab.X + ab.Y * ab.Y;
		if (abLenSq < 1e-6) continue;
		const t = math.clamp(point.sub(a).Dot(ab) / abLenSq, 0, 1);
		const proj = a.add(ab.mul(t));
		const d = proj.sub(point).Magnitude;
		if (d < bestDistance) {
			bestDistance = d;
			bestPoint = proj;
			bestIndex = i;
		}
	}
	return { point: bestPoint, edgeIndex: bestIndex } as const;
}

// Debug: render waypoints as parts and auto clean with DebrisService
function visualizeWaypoints(botId: string, waypoints: Vector2[]) {
	const container = new Instance("Folder");
	container.Name = `DebugPath_${botId}`;
	container.Parent = Workspace;

	for (let i = 0; i < waypoints.size(); i++) {
		const p2 = waypoints[i];
		const part = new Instance("Part");
		part.Name = `wp_${i + 1}`;
		part.Anchored = true;
		part.CanCollide = false;
		part.Size = new Vector3(0.6, 0.6, 0.6);
		part.Shape = Enum.PartType.Ball;
		part.Color =
			i === 0
				? Color3.fromRGB(0, 255, 0)
				: i === waypoints.size() - 1
					? Color3.fromRGB(255, 0, 0)
					: Color3.fromRGB(255, 255, 255);
		part.Position = new Vector3(p2.X, 50, p2.Y);
		part.Parent = container;
	}

	Debris.AddItem(container, 10);
}

// Helper: extend the path by one extra point continuing the last segment by a fixed distance
function appendEndpointExtension(waypoints: Vector2[], extensionStuds = 2) {
	if (waypoints.size() < 2) return;
	const last = waypoints[waypoints.size() - 1];
	const prev = waypoints[waypoints.size() - 2];
	const delta = last.sub(prev);
	const len = delta.Magnitude;
	if (len <= 1e-3) return;
	const unit = delta.div(len);
	const extra = last.add(unit.mul(extensionStuds));
	waypoints.push(extra);
}

// Helper: outward normal for an edge, pointing away from centroid
function computeOutwardNormal(edgeUnit: Vector2, start: Vector2, centroid: Vector2) {
	const normalCandidate = new Vector2(-edgeUnit.Y, edgeUnit.X);
	const altNormal = new Vector2(edgeUnit.Y, -edgeUnit.X);
	const toOutside = start.sub(centroid);
	return normalCandidate.Dot(toOutside) > 0 ? normalCandidate : altNormal;
}

// Helper: choose endpoint on polygon edge a given distance along the local edge direction
function chooseEndpointAlongEdge(polygonVectors: Vector2[], start: Vector2, edgeUnit: Vector2, distance: number) {
	const target = start.add(edgeUnit.mul(distance));
	const { point } = closestPointOnPolygonEdge(polygonVectors, target);
	return point;
}

// Helper: bulge sign for arc based on chord direction vs outward
function computeBulgeSign(chordUnit: Vector2, outwardNormal: Vector2) {
	const chordNormal = new Vector2(-chordUnit.Y, chordUnit.X);
	return chordNormal.Dot(outwardNormal) >= 0 ? 1 : -1;
}

// Helper: sample a point on a rotated semicircle from start (theta=pi) to end (theta=0)
// Legacy plain semicircle sampler (kept for reference / potential reuse)
function _sampleRotatedSemicirclePoint(params: {
	center: Vector2;
	radius: number;
	orientation: number; // rotation angle phi
	sign: number; // +1 or -1 to pick bulge side relative to orientation
	progress: number; // 0..1 along the arc
}) {
	const { center, radius, orientation, sign, progress } = params;
	const theta = math.pi * (1 - progress);
	const x =
		center.X +
		math.cos(theta) * radius * math.cos(orientation) -
		sign * math.sin(theta) * radius * math.sin(orientation);
	const y =
		center.Y +
		math.cos(theta) * radius * math.sin(orientation) +
		sign * math.sin(theta) * radius * math.cos(orientation);
	return new Vector2(x, y);
}

// Helper: like sampleRotatedSemicirclePoint but with a subtle radial wobble
function sampleWobblySemicirclePoint(params: {
	center: Vector2;
	baseRadius: number;
	orientation: number;
	sign: number;
	progress: number;
	wobbleAmplitude: number; // absolute studs to add/subtract from radius
	wobbleFrequency: number; // cycles across the semicircle
	wobblePhase: number; // radians
}) {
	const { center, baseRadius, orientation, sign, progress, wobbleAmplitude, wobbleFrequency, wobblePhase } = params;
	const theta = math.pi * (1 - progress);
	const wobble = wobbleAmplitude * math.sin(wobbleFrequency * theta + wobblePhase);
	const radius = math.max(0, baseRadius + wobble);
	const x =
		center.X +
		math.cos(theta) * radius * math.cos(orientation) -
		sign * math.sin(theta) * radius * math.sin(orientation);
	const y =
		center.Y +
		math.cos(theta) * radius * math.sin(orientation) +
		sign * math.sin(theta) * radius * math.cos(orientation);
	return new Vector2(x, y);
}

/**
 * Builds a human-like movement to take blob like chunk out ot outer world polygon
 * - Randomly picks a start vertex on the current polygon edge and an moves outward direction
 * - First segment steps outside (guaranteed not inside polygon)
 * - Moves outward for a risk-scaled distance with occasional left/right offsets
 * - Then gradually turns back and returns to polygon centroid with mild (random 0-5 degrees, in both directions) zigzags
 *
 * Risk level: 1..10 (1 = small excursion, 10 = large excursion)
 */
export function buildHumanLikePath(botId: string, fromPoint: Vector2, riskLevel = 5): Vector2[] {
	warn("buildHumanLikePath", { botId, fromPoint, riskLevel });
	const clampedRisk = math.clamp(riskLevel, 1, 10);
	const state = store.getState();
	const soldier = state.soldiers[botId];

	if (!soldier || soldier.polygon.size() < 3) {
		return defaultRectanglePath(fromPoint);
	}

	const polygonVectors = soldier.polygon as Vector2[];
	// polygonPoints currently unused in simplified arc algorithm (kept for future)
	// const polygonPoints = polygonVectors.map(vector2ToPoint);
	// tracers are not used for path validation in the simplified oval planner

	// Compute centroid
	let sum = new Vector2(0, 0);
	for (const v of polygonVectors) sum = sum.add(v);
	const centroid = sum.div(polygonVectors.size());

	// Start at the closest point on the polygon EDGE to fromPoint (not necessarily a vertex)
	const { point: startP, edgeIndex: bestEdgeIndex } = closestPointOnPolygonEdge(polygonVectors, fromPoint);

	// Local edge direction is along the chosen edge
	const edgeA = polygonVectors[bestEdgeIndex];
	const edgeB = polygonVectors[(bestEdgeIndex + 1) % polygonVectors.size()];
	const edgeVec = edgeB.sub(edgeA);
	const edgeUnit = edgeVec.Magnitude > 1e-3 ? edgeVec.div(edgeVec.Magnitude) : new Vector2(1, 0);

	// Outward normal (away from centroid)
	const outwardNormal = computeOutwardNormal(edgeUnit, startP, centroid);

	// RNG for randomness used in arc resolution and span
	const random = new Random();

	// Waypoints list - start from edge
	const waypoints: Vector2[] = [];
	waypoints.push(startP);

	// Generate path: single half-circle arc from start to endpoint (no extra steps)
	let current = startP;

	// Choose endpoint along polygon edge ahead of start index direction
	const alongSpan = 24 + clampedRisk * 10 + random.NextNumber() * 26; // simple span based on risk
	const endOnEdge = chooseEndpointAlongEdge(polygonVectors, startP, edgeUnit, alongSpan);

	// Circle with diameter from start to end; bulge to outward side
	const chordVec = endOnEdge.sub(current);
	const chordLen = chordVec.Magnitude;
	if (chordLen < 1) {
		waypoints.push(endOnEdge);
		return waypoints;
	}
	const chordUnit = chordVec.div(chordLen);
	const orientation = math.atan2(chordUnit.Y, chordUnit.X);
	const radius = chordLen / 2;
	const center = current.add(endOnEdge).div(2);

	// Determine bulge side using outward normal vs chord normal
	const sign = computeBulgeSign(chordUnit, outwardNormal);

	// Sample semicircle from start to end
	const steps = 12 + math.floor(random.NextNumber() * 6);
	const wobbleAmplitude = 1 + random.NextNumber() * (1.5 + clampedRisk * 0.2); // ~1..(1.5+)
	const wobbleFrequency = 2 + math.floor(random.NextNumber() * 2); // 2..3 ripples
	const wobblePhase = random.NextNumber() * 2 * math.pi;
	for (let i = 1; i < steps; i++) {
		const arcT = i / steps;
		const pointOnArc = sampleWobblySemicirclePoint({
			center,
			baseRadius: radius,
			orientation,
			sign,
			progress: arcT,
			wobbleAmplitude,
			wobbleFrequency,
			wobblePhase,
		});
		waypoints.push(pointOnArc);
		current = pointOnArc;
	}

	// Final endpoint on edge
	if (waypoints.size() === 0 || waypoints[waypoints.size() - 1] !== endOnEdge) waypoints.push(endOnEdge);

	// Extend path by a small endpoint extension
	appendEndpointExtension(waypoints, 2);

	// Debug display in TEST MODE (auto-removed by Debris)
	if (IS_TESTING_STUFF) {
		visualizeWaypoints(botId, waypoints);
	}

	warn("buildHumanLikePath done", { botId, fromPoint, riskLevel, waypoints });

	return waypoints;
}

function defaultRectanglePath(fromPoint: Vector2): Vector2[] {
	const random = new Random();
	const directions = [new Vector2(1, 0), new Vector2(-1, 0), new Vector2(0, 1), new Vector2(0, -1)];
	const dir = directions[random.NextInteger(1, directions.size()) - 1];
	const perp = new Vector2(-dir.Y, dir.X);

	const outward = 80;
	const width = 24 + random.NextNumber() * 24; // 24..48 studs

	const p0 = fromPoint;
	const p1 = p0.add(dir.mul(outward));
	const p2 = p1.add(perp.mul(width));
	const p3 = p2.sub(dir.mul(outward));
	const p4 = p3.sub(perp.mul(width));

	return [p0, p1, p2, p3, p4];
}

export function buildBotMovementPath(botId: string, fromPoint: Vector2): Vector2[] {
	// Sample a risk level with strong bias toward lower values.
	// Using u^k with k>1 skews distribution to small numbers (low risk common).
	const rand = new Random();
	const u = rand.NextNumber();
	const exponent = 2.8; // higher => stronger bias to low risk
	const risk = math.clamp(1 + math.floor(10 * math.pow(u, exponent)), 1, 10);
	return buildHumanLikePath(botId, fromPoint, risk);
}

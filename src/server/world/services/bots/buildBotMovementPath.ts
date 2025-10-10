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

// Helper: sample a point on a rotated semicircle from start (theta=pi) to end (theta=0)
function sampleRotatedSemicirclePoint(params: {
	center: Vector2;
	radius: number;
	orientation: number; // rotation angle phi
	sign: number; // +1 or -1 to pick bulge side relative to orientation
	t: number; // 0..1 along the arc
}) {
	const { center, radius, orientation, sign, t } = params;
	const theta = math.pi * (1 - t);
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
	const normalCandidate = new Vector2(-edgeUnit.Y, edgeUnit.X);
	const altNormal = new Vector2(edgeUnit.Y, -edgeUnit.X);
	const toOutside = startP.sub(centroid);
	const outwardNormal = normalCandidate.Dot(toOutside) > 0 ? normalCandidate : altNormal;

	// RNG for randomness used in arc resolution and span
	const random = new Random();

	// Waypoints list - start from edge
	const waypoints: Vector2[] = [];
	waypoints.push(startP);

	// Generate path: single half-circle arc from start to endpoint (no extra steps)
	let current = startP;

	// Choose endpoint along polygon edge ahead of start index direction
	const alongSpan = 24 + clampedRisk * 10 + random.NextNumber() * 26; // simple span based on risk
	const edgeGoal = startP.add(edgeUnit.mul(alongSpan));
	const { point: endOnEdge } = closestPointOnPolygonEdge(polygonVectors, edgeGoal);

	// Circle with diameter from start to end; bulge to outward side
	const chordVec = endOnEdge.sub(current);
	const chordLen = chordVec.Magnitude;
	if (chordLen < 1) {
		waypoints.push(endOnEdge);
		return waypoints;
	}
	const u = chordVec.div(chordLen);
	const phi = math.atan2(u.Y, u.X);
	const r = chordLen / 2;
	const center = current.add(endOnEdge).div(2);

	// Determine bulge side using outward normal vs chord normal
	const chordNormal = new Vector2(-u.Y, u.X);
	const sign = chordNormal.Dot(outwardNormal) >= 0 ? 1 : -1;

	// Sample semicircle from start to end
	const steps = 12 + math.floor(random.NextNumber() * 6);
	for (let i = 1; i < steps; i++) {
		const t = i / steps;
		const p = sampleRotatedSemicirclePoint({ center, radius: r, orientation: phi, sign, t });
		waypoints.push(p);
		current = p;
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

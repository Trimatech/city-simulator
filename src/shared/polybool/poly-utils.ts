import Object from "@rbxts/object-utils";
// Keep types local to shared to avoid client import from shared layer
export type PolygonOperation = "Intersect" | "Union" | "Difference" | "DifferenceRev" | "Xor";

import polybool, { Line, Point, PointShape, pointsToPolygon, Polygon } from "./polybool";

/**
 * Checks if a point is inside a polygon using ray casting algorithm
 * with early returns and bounds checking optimizations
 */
export function isPointInPolygon(point: Point, points: Point[]): boolean {
	// Early return for empty polygon
	if (points.size() === 0) {
		return false;
	}

	const [x, y] = point;

	// Quick bounds check
	let minX = math.huge;
	let maxX = -math.huge;
	let minY = math.huge;
	let maxY = -math.huge;

	// Calculate bounds
	for (const [px, py] of points) {
		minX = math.min(minX, px);
		maxX = math.max(maxX, px);
		minY = math.min(minY, py);
		maxY = math.max(maxY, py);
	}

	// Early return if point is outside bounds
	if (x < minX || x > maxX || y < minY || y > maxY) {
		return false;
	}

	let inside = false;
	// Ray casting algorithm
	for (let i = 0, j = points.size() - 1; i < points.size(); j = i++) {
		const [xi, yi] = points[i];
		const [xj, yj] = points[j];

		// Check if point is on the edge
		if (
			(yi === y && xi === x) || // Point is a vertex
			(yi === yj && y === yi && x > math.min(xi, xj) && x < math.max(xi, xj)) // Point is on horizontal edge
		) {
			return true;
		}

		// Ray casting check
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
			inside = !inside;
		}
	}

	return inside;
}

export function vector2ToPoint(vector2: Vector2) {
	return [vector2.X, vector2.Y] as Point;
}

export function vectorsToPoints(vectors: ReadonlyArray<Vector2>) {
	return vectors.map((vector) => vector2ToPoint(vector));
}

export function pointToVector2(point: Point) {
	return new Vector2(point[0], point[1]);
}

export function pointsToVectors(points: Point[]) {
	return points.map((point) => pointToVector2(point));
}

export function getLastPoint<T>(arr: T[], nth = 0) {
	return arr[arr.size() - nth - 1];
}

export function pointEquals(p1: Point, p2: Point) {
	if (p1 === undefined || p2 === undefined) {
		warn("pointEquals is undefined", { p1, p2 });
		return false;
	}

	if (p1.size() !== 2 || p2.size() !== 2) {
		warn("pointEquals is null", { p1, p2 });
		return false;
	}

	return roundCoordinate(p1[0]) === roundCoordinate(p2[0]) && roundCoordinate(p1[1]) === roundCoordinate(p2[1]);
}

export function shapeToPolygon(shape: PointShape[][]): Polygon {
	return { regions: shape, inverted: false };
}

export function calculatePolygonOperation(poly1: Polygon, poly2: Polygon, operation: PolygonOperation): Polygon {
	switch (operation) {
		case "Intersect":
			return polybool.intersect(poly1, poly2);
		case "Union":
			return polybool.union(poly1, poly2);
		case "Difference":
			return polybool.difference(poly1, poly2);
		case "DifferenceRev":
			return polybool.differenceRev(poly1, poly2);
		case "Xor":
			return polybool.xor(poly1, poly2);
	}
}

export function getNextRegion(region: PointShape[], i: number) {
	return region[(i + 1) % region.size()] as Point;
}

export function findIntersection(currentLine: [Point, Point], line2: [Point, Point]): Point | undefined {
	const [p1, p2] = currentLine;
	const [p3, p4] = line2;

	const denominator = (p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);

	if (denominator === 0) {
		return undefined;
	}

	const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator;
	const ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator;

	// Check if intersection point lies within both line segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return undefined;
	}

	const x = p1[0] + ua * (p2[0] - p1[0]);
	const y = p1[1] + ua * (p2[1] - p1[1]);

	return roundPoint([x, y]);
}

export function findIntersectionWithPolygon(
	line: [Point, Point],
	polygon: Polygon,
): { intersection: Point; intersectedLine: [Point, Point] } | undefined {
	for (const region of polygon.regions) {
		for (let i = 0; i < region.size(); i++) {
			const nextPoint = region[(i + 1) % region.size()] as Point;
			const intersectedLine: [Point, Point] = [region[i] as Point, nextPoint];
			const intersection = findIntersection(line, intersectedLine);
			if (intersection) {
				return { intersection, intersectedLine };
			}
		}
	}
	return undefined;
}

// Add this helper function to calculate distance between points
function getDistanceBetweenPoints(p1: Point, p2: Point): number {
	const dx = math.abs(p2[0] - p1[0]);
	const dy = math.abs(p2[1] - p1[1]);
	return math.sqrt(dx * dx + dy * dy);
}

function getCenterPoint(line: Line): Point {
	const [startPoint, endPoint] = line;
	return [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];
}

export function connectLineToPolygon(line: Line, polygon: Polygon) {
	const region = polygon.regions[0] as Point[];
	let closestIntersection: { point: Point; distance: number } | undefined;

	for (let i = 0; i < region.size(); i++) {
		const currentPoint = region[i] as Point;
		const nextPoint = region[(i + 1) % region.size()] as Point;
		const currentEdge: Line = [currentPoint, nextPoint];

		const intersection = findIntersection(extendLine(line), currentEdge);

		if (intersection) {
			const distance = getDistanceBetweenPoints(getCenterPoint(line), intersection);
			if (!closestIntersection || distance < closestIntersection.distance) {
				closestIntersection = { point: intersection, distance };
			}
		}
	}

	if (closestIntersection) {
		return [closestIntersection.point, line[1]];
	}

	//warn("No intersection found when connecting line to polygon", { line, polygon });
	warn("No intersection found when connecting line to polygon");

	return [getCenterPoint(line)];
}

export function addIntersectionPointsWithLines(cutLines: Line[], polygon: Polygon) {
	const newPolygon = Object.deepCopy(polygon);
	const cutPoints: Point[] = [];

	const regionIndex = 0;
	const points = newPolygon.regions[regionIndex];

	// For each line we're checking against
	for (const cutLine of cutLines) {
		let closestIntersection: { point: Point; distance: number; index: number } | undefined;

		let i = 0;
		while (i < points.size()) {
			const currentPoint = points[i] as Point;
			const nextPoint = points[(i + 1) % points.size()] as Point;
			const currentEdge: Line = [currentPoint, nextPoint];

			const intersectionPoint = findIntersection(extendLine(cutLine), currentEdge);
			if (intersectionPoint) {
				const distance = getDistanceBetweenPoints(getCenterPoint(cutLine), intersectionPoint);

				if (!closestIntersection || distance < closestIntersection.distance) {
					closestIntersection = { point: intersectionPoint, distance, index: i };
				}
			}
			i++;
		}

		// Insert only the closest intersection point if one was found
		if (closestIntersection) {
			const insertIndex = closestIntersection.index + 1;
			points.insert(insertIndex, closestIntersection.point);
			cutPoints.push(closestIntersection.point);
		}
	}

	const intersectionIndexes = cutPoints.map((point) => points.findIndex((p) => pointEquals(p as Point, point)));

	if (intersectionIndexes.size() < 2) {
		warn("Not enough intersection indexes found", {
			intersectionIndexes,
			cutPoints,
			cutLines,
			extendedCutLines: cutLines.map(extendLine),
		});
	}

	return {
		polygon: newPolygon,
		intersectionIndexes,
		cutPoints,
		regionIndexes: [0],
	};
}

export function getFirstAndLastLines(points: Point[]): Line[] {
	if (points.size() <= 1) {
		warn(`points.size() <= 1`);
		return [];
	}

	if (points.size() === 2) {
		return [[points[0], points[1]]];
	}

	return [
		[points[0], points[1]],
		[getLastPoint(points, 1), getLastPoint(points, 0)],
	];
}

export function takePartOfPolygon(polygon: Polygon, startIndex: number, endIndex: number) {
	const newPolygon = Object.deepCopy(polygon);
	const newRegion = newPolygon.regions[0].move(startIndex, endIndex, 0, []);
	newPolygon.regions[0] = newRegion;
	return newPolygon;
}

export function replaceFirstAndLastPoints(points: Point[], firstPoint: Point, lastPoint: Point) {
	const newPoints = [...points];
	newPoints[0] = firstPoint;
	newPoints[newPoints.size() - 1] = lastPoint;

	return newPoints;
}

export function removeFirstAndLastPoints(points: Point[]) {
	const newPoints = [...points];
	newPoints.remove(0);
	newPoints.remove(newPoints.size() - 1);

	return newPoints;
}

export function reverseArray<T>(arr: T[]) {
	const reversedArray = [];
	for (let i = arr.size() - 1; i >= 0; i--) {
		reversedArray.push(arr[i]);
	}
	return reversedArray;
}

export function sliceArray<T extends defined>(arr: T[], startIndex: number, endIndex: number) {
	const result: T[] = [];
	for (let i = startIndex; i < endIndex; i++) {
		result.push(arr[i]);
	}
	return result;
}

export function getJoinedPoints(existingPoints: Point[], drawPoints: Point[]) {
	if (drawPoints.size() === 0) {
		warn("drawPoints.size() === 0");
		return [];
	}

	if (existingPoints.size() === 0) {
		warn("existingPoints.size() === 0");
		return [];
	}

	const firstPoint = drawPoints[0];
	const lastPoint = getLastPoint(drawPoints);

	const hasMatchingFirst = pointEquals(existingPoints[0], drawPoints[0]);
	const hasMatchingLast = pointEquals(existingPoints[existingPoints.size() - 1], drawPoints[drawPoints.size() - 1]);

	if (hasMatchingFirst && hasMatchingLast) {
		const pointsToInsert = removeFirstAndLastPoints(reverseArray(drawPoints));
		return [...existingPoints, ...pointsToInsert];
	}

	const hasMatchingFirstLast = pointEquals(existingPoints[0], drawPoints[drawPoints.size() - 1]);
	const hasMatchingLastFirst = pointEquals(existingPoints[existingPoints.size() - 1], drawPoints[0]);

	if (hasMatchingFirstLast && hasMatchingLastFirst) {
		const pointsToInsert = removeFirstAndLastPoints(drawPoints);
		return [...existingPoints, ...pointsToInsert];
	}

	error("No matching points found");
	// Find indexes of matching points in existing points
	const firstMatchIndex = existingPoints.findIndex((point) => pointEquals(point, firstPoint));
	const lastMatchIndex = existingPoints.findIndex((point) => pointEquals(point, lastPoint));

	if (firstMatchIndex === -1 || lastMatchIndex === -1) {
		error("Matching points not found in existingPoints");
	}

	// Check if we need to reverse updatedPoints
	const shouldReverse = firstMatchIndex > lastMatchIndex;
	const pointsToInsert = shouldReverse ? reverseArray(drawPoints) : drawPoints;

	// Remove duplicates at connection points
	const trimmedPointsToInsert = sliceArray(pointsToInsert, 1, pointsToInsert.size() - 1);

	// Build result array based on direction
	let result: Point[];
	if (shouldReverse) {
		result = [
			...sliceArray(existingPoints, 0, lastMatchIndex + 1),
			...trimmedPointsToInsert,
			...sliceArray(existingPoints, firstMatchIndex, existingPoints.size()),
		];
	} else {
		result = [
			...sliceArray(existingPoints, 0, firstMatchIndex + 1),
			...trimmedPointsToInsert,
			...sliceArray(existingPoints, lastMatchIndex, existingPoints.size()),
		];
	}

	return result;
}

export function replaceFirstAndLastPointsWith(points: Point[], cutPoints: Point[]) {
	const newPoints = [...points];
	newPoints[0] = cutPoints[0];
	newPoints[newPoints.size() - 1] = cutPoints[cutPoints.size() - 1];
	return newPoints;
}

/**
 * Extends a line segment in both directions by a given factor
 */
function extendLine(line: Line): Line {
	const [startPoint, endPoint] = line;

	const direction = [endPoint[0] - startPoint[0], endPoint[1] - startPoint[1]];
	const length = math.sqrt(direction[0] ** 2 + direction[1] ** 2);
	const unitDirection = [direction[0] / length, direction[1] / length];

	const extensionFactor = 1000;

	return [
		[startPoint[0] - unitDirection[0] * extensionFactor, startPoint[1] - unitDirection[1] * extensionFactor],
		[endPoint[0] + unitDirection[0] * extensionFactor, endPoint[1] + unitDirection[1] * extensionFactor],
	];
}

const filterOutPointsInsidePolygon = (points: Point[], polygon: Polygon) => {
	const region = polygon.regions[0] as Point[];
	const pointsCopy = [...points];

	// Remove points from the beginning but leave the last point that is inside
	while (
		pointsCopy.size() > 1 &&
		isPointInPolygon(pointsCopy[0], region) &&
		isPointInPolygon(pointsCopy[1], region)
	) {
		pointsCopy.shift();
	}

	// Remove points from the end but leave the last point that is inside
	while (
		pointsCopy.size() > 1 &&
		isPointInPolygon(pointsCopy[pointsCopy.size() - 1], region) &&
		isPointInPolygon(pointsCopy[pointsCopy.size() - 2], region)
	) {
		pointsCopy.pop();
	}

	return pointsCopy;
};

// Update setIntersectionPoints to use the new function
export function setIntersectionPoints(polygon: Polygon, drawPointsTemp: Point[]) {
	const drawPoints = filterOutPointsInsidePolygon(drawPointsTemp, polygon);
	if (drawPoints.size() < 3) {
		warn("drawPoints.size() < 3");
		return undefined;
	}

	const points = polygon.regions[0];

	if (points.size() < 4) {
		warn("points.size() < 4");
		return undefined;
	}

	//warn("setIntersectionPoints......", drawPoints);

	const clonedPolygon = Object.deepCopy(polygon);

	const {
		polygon: polygonWithIntersections,
		intersectionIndexes,
		cutPoints,
	} = addIntersectionPointsWithLines(getFirstAndLastLines(drawPoints), clonedPolygon);

	const isValid = intersectionIndexes.size() >= 2 && cutPoints.size() >= 2;

	if (isValid) {
		let startIndex = intersectionIndexes[0];
		let endIndex = intersectionIndexes[1];

		if (startIndex > endIndex) {
			[startIndex, endIndex] = [endIndex, startIndex];
		}

		const partOfResultPolygon = takePartOfPolygon(polygonWithIntersections, startIndex, endIndex);
		const existingPoints = partOfResultPolygon.regions[0] as Point[];

		if (existingPoints.size() === 0) {
			warn("existingPoints.size() === 0");
			return undefined;
		}

		const joinedPoints = getJoinedPoints(existingPoints, replaceFirstAndLastPointsWith(drawPoints, cutPoints));

		return pointsToPolygon(joinedPoints);
	} else {
		warn("No intersection points found even with extended lines", {
			intersectionIndexes,
			cutPoints,
			polygonWithIntersections,
		});
		return undefined;
	}
}

// Add this helper function at the top with other utility functions
function roundCoordinate(num: number): number {
	return num; //math.round(num * 100000) / 100000;
}

function roundPoint(point: Point): Point {
	return [roundCoordinate(point[0]), roundCoordinate(point[1])];
}

export interface BoundingBox {
	min: Vector2;
	max: Vector2;
	size: Vector2;
}

export function calculatePolygonBoundingBox(points: Point[]): BoundingBox {
	let minX = math.huge;
	let minY = math.huge;
	let maxX = -math.huge;
	let maxY = -math.huge;

	for (const point of points) {
		minX = math.min(minX, point[0]);
		minY = math.min(minY, point[1]);
		maxX = math.max(maxX, point[0]);
		maxY = math.max(maxY, point[1]);
	}

	const min = new Vector2(minX, minY);
	const max = new Vector2(maxX, maxY);
	const size = max.sub(min);

	return { min, max, size };
}

export function calculateVector2ArrayBoundingBox(points: ReadonlyArray<Vector2>): BoundingBox {
	let minX = math.huge;
	let minY = math.huge;
	let maxX = -math.huge;
	let maxY = -math.huge;

	for (const v of points) {
		minX = math.min(minX, v.X);
		minY = math.min(minY, v.Y);
		maxX = math.max(maxX, v.X);
		maxY = math.max(maxY, v.Y);
	}

	const min = new Vector2(minX, minY);
	const max = new Vector2(maxX, maxY);
	const size = max.sub(min);

	return { min, max, size };
}

export function aabbIntersects(a: BoundingBox, b: BoundingBox): boolean {
	if (a.max.X < b.min.X || a.min.X > b.max.X) return false;
	if (a.max.Y < b.min.Y || a.min.Y > b.max.Y) return false;
	return true;
}

// Select the largest region by polygon area from a PolyBool result
export function selectLargestRegionByArea(regions: Array<Array<PointShape>>): Point[] | undefined {
	let bestRegion: Point[] | undefined = undefined;
	let bestArea = -1;
	for (const region of regions) {
		const pts = region.filter((p) => p.size() === 2) as unknown as Point[];
		if (pts.size() <= 2) continue;
		const poly = pointsToVectors(pts);
		// local import to avoid circular deps: calculatePolygonArea lives in polygon-extra.utils
		// we inline a tiny area computation to avoid coupling
		let area = 0;
		const length = poly.size();
		for (let i = 0; i < length; i++) {
			const j = (i + 1) % length;
			area += poly[i].X * poly[j].Y;
			area -= poly[j].X * poly[i].Y;
		}
		const absArea = math.abs(area) / 2;
		if (absArea > bestArea) {
			bestArea = absArea;
			bestRegion = pts;
		}
	}
	return bestRegion;
}

import Object from "@rbxts/object-utils";
import { PolygonOperation } from "client/components/polygon-clipper/PolygonClipper.types";

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
	return p1[0] === p2[0] && p1[1] === p2[1];
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

	return [x, y];
}

export function findIntersectionWithPolygon(
	line: [Point, Point],
	polygon: Polygon,
): { intersection: Point; intersectedLine: [Point, Point] } | undefined {
	for (const region of polygon.regions) {
		for (let i = 0; i < region.size(); i++) {
			const nextPoint = getNextRegion(region, i);
			const intersectedLine: [Point, Point] = [region[i] as Point, nextPoint];
			const intersection = findIntersection(line, intersectedLine);
			if (intersection) {
				return { intersection, intersectedLine };
			}
		}
	}
	return undefined;
}

export function addIntersectionPointsWithLines(lines: Line[], polygon: Polygon) {
	const newPolygon = Object.deepCopy(polygon);
	const cutPoints: Point[] = [];

	const regionIndex = 0;
	const points = newPolygon.regions[regionIndex];

	// For each line we're checking against
	for (const line of lines) {
		// For each edge in the polygon
		let i = 0;
		while (i < points.size()) {
			const currentPoint = points[i] as Point;
			const nextPoint = getNextRegion(points, i);
			const currentEdge: Line = [currentPoint, nextPoint];

			const intersectionPoint = findIntersection(currentEdge, line);
			if (intersectionPoint) {
				// Insert the intersection point immediately after the current point
				const insertIndex = i + 1;
				points.insert(insertIndex, intersectionPoint);
				cutPoints.push(intersectionPoint);
				i++; // Skip over the point we just inserted
			}
			i++;
		}
	}

	const intersectionIndexes = cutPoints.map((point) => points.findIndex((p) => pointEquals(p as Point, point)));

	return {
		polygon: newPolygon,
		intersectionIndexes,
		cutPoints,
		regionIndexes: [0],
	};
}

export function getFirstAndLastLines(points: Point[]): Line[] {
	if (points.size() <= 1) {
		error(`points.size() <= 1`);
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
function extendLine(line: Line, extensionFactor = 1000): Line {
	const [startPoint, endPoint] = line;
	const dx = endPoint[0] - startPoint[0];
	const dy = endPoint[1] - startPoint[1];

	return [
		[startPoint[0] - dx * extensionFactor, startPoint[1] - dy * extensionFactor],
		[endPoint[0] + dx * extensionFactor, endPoint[1] + dy * extensionFactor],
	];
}

/**
 * Finds the nearest intersection point between a line and a polygon
 */
function findNearestIntersection(
	line: Line,
	polygon: Polygon,
	referencePoint: Point,
): { intersection: Point; intersectedLine: Line } | undefined {
	let nearestIntersection: Point | undefined;
	let nearestDistance = math.huge;
	let nearestIntersectedLine: Line | undefined;

	for (const region of polygon.regions) {
		for (let i = 0; i < region.size(); i++) {
			const nextPoint = getNextRegion(region, i);
			const intersectedLine: Line = [region[i] as Point, nextPoint];
			const intersection = findIntersection(line, intersectedLine);

			if (intersection) {
				const distance =
					math.abs(intersection[0] - referencePoint[0]) + math.abs(intersection[1] - referencePoint[1]);

				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestIntersection = intersection;
					nearestIntersectedLine = intersectedLine;
				}
			}
		}
	}

	if (nearestIntersection && nearestIntersectedLine) {
		return { intersection: nearestIntersection, intersectedLine: nearestIntersectedLine };
	}
	return undefined;
}

// Update setIntersectionPoints to use the new function
export function setIntersectionPoints(polygon: Polygon, drawPoints: Point[]) {
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
		const joinedPoints = getJoinedPoints(existingPoints, replaceFirstAndLastPointsWith(drawPoints, cutPoints));

		return pointsToPolygon(joinedPoints);
	} else {
		warn("No intersection points found even with extended lines");
		return undefined;
	}
}

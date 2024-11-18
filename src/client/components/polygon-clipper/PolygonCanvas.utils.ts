import { Line, Point, PointShape } from "shared/polybool/Geometry";
import { pointToPolygon, Polygon } from "shared/polybool/polybool";
import { PolygonState } from "./PolygonClipper.types";
import { DemoPolygon } from "./demo-cases";
import Object from "@rbxts/object-utils";
import { HttpService } from "@rbxts/services";

export function snapToGrid(point: Point): Point {
	return [math.round(point[0] / 10) * 10, math.round(point[1] / 10) * 10];
}

// Helper functions
export function drawPolygon(canvas: Frame, polygon: Polygon, color: Color3, transparency = 0) {
	polygon.regions.forEach((region) => {
		// Draw lines between points
		for (let i = 0; i < region.size(); i++) {
			const current = region[i];
			const nextRegion = region[(i + 1) % region.size()];

			const line = new Instance("Frame");
			line.BackgroundColor3 = color;
			line.BackgroundTransparency = transparency;
			line.BorderSizePixel = 0;

			// Calculate line position and size
			const dx = nextRegion[0] - current[0];
			const dy = nextRegion[1] - current[1];
			const angle = math.atan2(dy, dx);
			const length = math.sqrt(dx * dx + dy * dy);

			line.Size = new UDim2(0, length, 0, 2);
			line.Position = new UDim2(0, current[0], 0, current[1]);
			line.Rotation = math.deg(angle);
			line.Parent = canvas;
		}

		// Draw points
		region.forEach((point) => {
			const vertex = new Instance("Frame");
			vertex.BackgroundColor3 = color;
			vertex.BackgroundTransparency = transparency;
			vertex.BorderSizePixel = 0;
			vertex.Size = new UDim2(0, 6, 0, 6);
			vertex.Position = new UDim2(0, point[0] - 3, 0, point[1] - 3);
			vertex.Parent = canvas;
		});
	});
}
export type PolygonName = "poly1" | "poly2" | "result";

export interface ClosestPointResult {
	polygonIndex: number;
	regionIndex: number;
	pointIndex: number;
	distance: number;
}

export function getNormMousePos(mousePos: Vector3, framePosition: Vector2) {
	return new Vector2(mousePos.X - framePosition.X, mousePos.Y - framePosition.Y);
}

export function pointToVector2(point: Point) {
	return new Vector2(point[0], point[1]);
}

export function vector2ToPoint(vector2: Vector2) {
	return [vector2.X, vector2.Y] as Point;
}

export function getLastPoint<T>(arr: T[], nth = 0) {
	return arr[arr.size() - nth - 1];
}

export function pointEquals(p1: Point, p2: Point) {
	return p1[0] === p2[0] && p1[1] === p2[1];
}

export function findClosestPoint(mousePos: Vector2, polygons: Polygon[], range = 100000) {
	let closestDist = math.huge;
	let closest: ClosestPointResult | undefined;

	// warn(`checking ${polyName} r${regionIndex} p${pointIndex}=${point[0]}_${point[1]}`);

	const mouseX = mousePos.X;
	const mouseY = mousePos.Y;
	// warn(`.... mouse x=${mouseX}, y=${mouseY}`);

	const setClosestIfCloser = (point: PointShape, polygonIndex: number, regionIndex: number, pointIndex: number) => {
		const dist = math.sqrt(math.pow(mouseX - point[0], 2) + math.pow(mouseY - point[1], 2));
		if (dist < closestDist && dist < range) {
			// 10 is hit radius
			closestDist = dist;
			closest = { polygonIndex, regionIndex, pointIndex, distance: dist };
		}
	};

	polygons.forEach((polygon, polygonIndex) => {
		polygon.regions.forEach((region, regionIndex) => {
			region.forEach((point, pointIndex) => {
				setClosestIfCloser(point, polygonIndex, regionIndex, pointIndex);
			});
		});
	});

	return closest;
}

export function calculateSnappedPosition(input: InputObject, rbx: Frame, snap: boolean) {
	const position = input.Position;
	const framePosition = rbx.AbsolutePosition;
	const mouseX = position.X - framePosition.X;
	const mouseY = position.Y - framePosition.Y;
	const newPos: Point = [mouseX, mouseY];
	return snap ? snapToGrid(newPos) : newPos;
}

export const updatePolygonPoint = (params: {
	input: InputObject;
	rbx: Frame;
	snap: boolean;
	isPoly1: boolean;
	regionIndex: number;
	pointIndex: number;
	poly1: Polygon;
	poly2: Polygon;
}) => {
	const { input, rbx, snap, isPoly1, regionIndex, pointIndex, poly1, poly2 } = params;
	const snappedPos = calculateSnappedPosition(input, rbx, snap);

	const changedPolygon = isPoly1 ? poly1 : poly2;
	changedPolygon.regions[regionIndex][pointIndex] = snappedPos;
	return changedPolygon;
};

export function getNextRegion(region: PointShape[], i: number) {
	return region[(i + 1) % region.size()] as Point;
}

export function findIntersection(line1: [Point, Point], line2: [Point, Point]): Point | undefined {
	const [p1, p2] = line1;
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

export function cutLinesFromPolygon(polygon: Polygon, drawPoints: Point[]) {
	const clonedPolygon = Object.deepCopy(polygon);

	const {
		polygon: polygonWithIntersections,
		intersectionIndexes,
		cutPoints,
	} = addIntersectionPointsWithLines(getFirstAndLastLines(drawPoints), clonedPolygon);

	if (intersectionIndexes.size() >= 2 && cutPoints.size() >= 2) {
		let startIndex = intersectionIndexes[0];
		let endIndex = intersectionIndexes[1];

		if (startIndex > endIndex) {
			[startIndex, endIndex] = [endIndex, startIndex];
		}

		const partOfResultPolygon = takePartOfPolygon(polygonWithIntersections, startIndex, endIndex);

		const existingPoints = partOfResultPolygon.regions[0] as Point[];

		const joinedPoints = getJoinedPoints(existingPoints, replaceFirstAndLastPointsWith(drawPoints, cutPoints));

		//	error(HttpService.JSONEncode(joinedPoints));
		return pointToPolygon(joinedPoints);
	} else {
		warn("No intersection points found");
		return { inverted: false, regions: [] };
	}
}

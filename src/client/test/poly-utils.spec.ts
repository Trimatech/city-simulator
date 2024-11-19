/// <reference types="@rbxts/testez/globals" />

import Object from "@rbxts/object-utils";
import { HttpService } from "@rbxts/services";
import {
	addIntersectionPointsWithLines,
	calculatePolygonOperation,
	getFirstAndLastLines,
	getJoinedPoints,
	getLastPoint,
	replaceFirstAndLastPoints,
	replaceFirstAndLastPointsWith,
	setIntersectionPoints,
	takePartOfPolygon,
} from "shared/polybool/poly-utils";
import { Line, Point, Polygon } from "shared/polybool/polybool";

function verySimpleRect(): Polygon {
	return {
		inverted: false,
		regions: [
			[
				[0, 0],
				[4, 0],
				[4, 3],
				[0, 3],
			],
		],
	};
}

function simpleRect(): Polygon {
	return {
		inverted: false,
		regions: [
			[
				[0, 0],
				[100, 0],
				[100, 100],
				[0, 100],
			],
		],
	};
}

const mShapePoints: Point[] = [
	[0, 0],
	[40, 0],
	[40, 40],
	[20, 20],
	[0, 40],
];

function simpleMShape(): Polygon {
	return {
		inverted: false,
		regions: [mShapePoints],
	};
}

const mShapeWithIntersectionPoints: Point[] = [
	[0, 0],
	[40, 0],
	[40, 40],
	[30, 30],
	[20, 20],
	[10, 30],
	[0, 40],
];

// U shape polygon
function uShapedPolygon(): Polygon {
	return {
		inverted: false,
		regions: [
			[
				[0, 0],
				[70, 0],
				[70, 10],
				[50, 10],
				[40, 20],
				[30, 20],
				[20, 10],
				[0, 10],
			],
		],
	};
}

const uShapePoints: Point[] = [
	[60, 10],
	[40, 30],
	[30, 30],
	[10, 10],
];

const uShapeWithIntersectionPoints = [
	[0, 0],
	[70, 0],
	[70, 10],
	[60, 10],
	[50, 10],
	[40, 20],
	[30, 20],
	[20, 10],
	[10, 10],
	[0, 10],
];

// Other
const cutLineFromMShape: Point[] = [
	[10, 30],
	[30, 30],
];

const vShapePoints: Point[] = [
	[10, 80],
	[50, 120],
	[90, 80],
];

const vShapeWithIntersectionPoints = [
	[0, 0],
	[100, 0],
	[100, 100],
	[70, 100],
	[30, 100],
	[0, 100],
];

const vShapeLines: Line[] = [
	[vShapePoints[0], vShapePoints[1]],
	[vShapePoints[1], vShapePoints[2]],
];

export = () => {
	describe("addIntersectionPointsWithLines", () => {
		it("should add intersection point when line intersects polygon in one point", () => {
			const polygon = simpleRect();

			// Cut top of square, from center
			const lines: Line[] = [
				[
					[50, 0],
					[50, 50],
				],
			];

			const result = addIntersectionPointsWithLines(lines, polygon);

			expect(result.intersectionIndexes.size()).to.equal(1);

			const expectedPoints = [
				[0, 0],
				[50, 0],
				[100, 0],
				[100, 100],
				[0, 100],
			];
			const newPoints = result.polygon.regions[0];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should add intersection point when line intersects polygon in two points", () => {
			const polygon = simpleRect();

			// Cut top of square, from center
			const lines: Line[] = [
				[
					[50, 0],
					[50, 100],
				],
			];

			const result = addIntersectionPointsWithLines(lines, polygon);

			expect(result.intersectionIndexes.size()).to.equal(2);

			const expectedPoints = [
				[0, 0],
				[50, 0],
				[100, 0],
				[100, 100],
				[50, 100],
				[0, 100],
			];
			const newPoints = result.polygon.regions[0];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should handle multiple intersecting lines", () => {
			const polygon = simpleRect();

			const lines: Line[] = [
				[
					[-50, 25],
					[150, 25],
				], // Horizontal line at y=25
				[
					[-50, 75],
					[150, 75],
				], // Horizontal line at y=75
			];

			const result = addIntersectionPointsWithLines(lines, polygon);

			// Should create 4 intersection points (2 for each line)
			expect(result.intersectionIndexes.size()).to.equal(4);

			const expectedPoints = [
				[0, 0],
				[100, 0],
				[100, 25],
				[100, 75],
				[100, 100],
				[0, 100],
				[0, 75],
				[0, 25],
			];

			// Check if all intersection points were added
			const newPoints = result.polygon.regions[0];
			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("cut v shape from bottom of square", () => {
			const polygon = simpleRect();

			const result = addIntersectionPointsWithLines(vShapeLines, polygon);

			expect(result.intersectionIndexes.size()).to.equal(2);
			expect(result.intersectionIndexes[0]).to.equal(4);
			expect(result.intersectionIndexes[1]).to.equal(3);

			const newPoints = result.polygon.regions[0];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(vShapeWithIntersectionPoints));
		});

		it("cut line from M shape", () => {
			const polygon = simpleMShape();

			const lines = getFirstAndLastLines(cutLineFromMShape);

			const result = addIntersectionPointsWithLines(lines, polygon);

			expect(result.intersectionIndexes.size()).to.equal(2);
			expect(result.intersectionIndexes[0]).to.equal(3);
			expect(result.intersectionIndexes[1]).to.equal(5);

			const newPoints = result.polygon.regions[0];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(mShapeWithIntersectionPoints));
		});

		it("cut line from U shape", () => {
			const polygon = uShapedPolygon();

			const lines = getFirstAndLastLines(uShapePoints);

			const result = addIntersectionPointsWithLines(lines, polygon);

			expect(result.intersectionIndexes.size()).to.equal(2);
			expect(result.intersectionIndexes[0]).to.equal(3);
			expect(result.intersectionIndexes[1]).to.equal(8);

			const newPoints = result.polygon.regions[0];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(uShapeWithIntersectionPoints));
		});

		it("should not modify original polygon", () => {
			const polygon = simpleRect();

			const originalPolygon = Object.deepCopy(polygon);
			const lines: Line[] = [
				[
					[-50, 50],
					[150, 50],
				],
			];

			addIntersectionPointsWithLines(lines, polygon);

			// Original polygon should remain unchanged
			expect(HttpService.JSONEncode(originalPolygon)).to.equal(HttpService.JSONEncode(polygon));
		});
	});

	describe("getFirstAndLastLines", () => {
		it("should return only one line if 2 points", () => {
			const points: Point[] = [
				[0, 0],
				[1, 1],
			];

			const lines = getFirstAndLastLines(points);
			const expedtedLines = [
				[
					[0, 0],
					[1, 1],
				],
			];

			expect(lines.size()).to.equal(1);
			expect(HttpService.JSONEncode(lines)).to.equal(HttpService.JSONEncode(expedtedLines));
		});

		it("should return return correctly with M shape", () => {
			const lines = getFirstAndLastLines(cutLineFromMShape);

			const expectedLines = [
				[
					[10, 30],
					[30, 30],
				],
			];
			expect(lines.size()).to.equal(1);
			expect(HttpService.JSONEncode(lines)).to.equal(HttpService.JSONEncode(expectedLines));
		});
	});

	describe("getLastPoint", () => {
		it("should return last point", () => {
			const points: Point[] = [
				[0, 0],
				[1, 1],
			];

			const lastPoint = getLastPoint(points);
			const expedtedPoint = [1, 1];

			expect(HttpService.JSONEncode(lastPoint)).to.equal(HttpService.JSONEncode(expedtedPoint));
		});

		it("should return next to last point", () => {
			const points: Point[] = [
				[0, 0],
				[1, 1],
			];

			const nextToLastPoint = getLastPoint(points, 1);
			const expedtedPoint = [0, 0];

			expect(HttpService.JSONEncode(nextToLastPoint)).to.equal(HttpService.JSONEncode(expedtedPoint));
		});
	});

	describe("takePartOfPolygon", () => {
		it("should take part of polygon", () => {
			const polygon: Polygon = {
				inverted: false,
				regions: [mShapeWithIntersectionPoints] as Point[][],
			};

			const newPolygon = takePartOfPolygon(polygon, 3, 5);

			const expectedPoints = [
				[30, 30],
				[20, 20],
				[10, 30],
			];

			expect(HttpService.JSONEncode(newPolygon.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should take part of polygon v shape", () => {
			const polygon: Polygon = {
				inverted: false,
				regions: [vShapeWithIntersectionPoints] as Point[][],
			};

			const newPolygon = takePartOfPolygon(polygon, 3, 4);

			const expectedPoints = [
				[70, 100],
				[30, 100],
			];
			expect(HttpService.JSONEncode(newPolygon.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));
		});
	});

	describe("replaceFirstAndLastPoints", () => {
		it("should replace first and last points", () => {
			const firstPoint: Point = [70, 100];
			const lastPoint: Point = [30, 100];

			const newPoints = replaceFirstAndLastPoints(vShapePoints, firstPoint, lastPoint);

			const expectedPoints = [
				[70, 100],
				[50, 120],
				[30, 100],
			];

			expect(HttpService.JSONEncode(newPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});
	});

	describe("getJoinedPoints", () => {
		it("should join points ", () => {
			const polyPoints: Point[] = [
				[1, 1],
				[2, 2],
				[5, 5],
			];
			const drawPoints: Point[] = [
				[1, 1],
				[3, 3],
				[5, 5],
			];

			const points = getJoinedPoints(polyPoints, drawPoints);

			const expectedPoints = [
				[1, 1],
				[2, 2],
				[5, 5],
				[3, 3],
			];

			expect(HttpService.JSONEncode(points)).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should join points if draw points are reversed", () => {
			const polyPoints: Point[] = [
				[1, 1],
				[2, 2],
				[5, 5],
			];
			const drawPoints: Point[] = [
				[5, 5],
				[3, 3],
				[1, 1],
			];

			const points = getJoinedPoints(polyPoints, drawPoints);

			const expectedPoints = [
				[1, 1],
				[2, 2],
				[5, 5],
				[3, 3],
			];

			expect(HttpService.JSONEncode(points)).to.equal(HttpService.JSONEncode(expectedPoints));
		});
	});

	describe("replaceFirstAndLastPointsWith", () => {
		it("should replace first and last points when 2 points", () => {
			const points: Point[] = [
				[0, 0],
				[5, 5],
			];
			const cutPoints: Point[] = [
				[1, 1],
				[6, 6],
			];

			const newDrawPoints = replaceFirstAndLastPointsWith(points, cutPoints);

			const expectedPoints = [
				[1, 1],
				[6, 6],
			];

			expect(HttpService.JSONEncode(newDrawPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should replace first and last points", () => {
			const points: Point[] = [
				[0, 0],
				[3, 3],
				[5, 5],
			];
			const cutPoints: Point[] = [
				[1, 1],
				[6, 6],
			];

			const newDrawPoints = replaceFirstAndLastPointsWith(points, cutPoints);

			const expectedPoints = [
				[1, 1],
				[3, 3],
				[6, 6],
			];

			expect(HttpService.JSONEncode(newDrawPoints)).to.equal(HttpService.JSONEncode(expectedPoints));
		});
	});

	describe("cutLinesFromPolygon", () => {
		it("should cut V shape from rectangle polygon", () => {
			const polygon = simpleRect();

			const newPolygon = setIntersectionPoints(polygon, vShapePoints);
			const expectedPoints = [
				[70, 100],
				[30, 100],
				[50, 120],
			];

			expect(HttpService.JSONEncode(newPolygon?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));

			const resultPolygon = calculatePolygonOperation(polygon, newPolygon as Polygon, "Union");

			const expectedResultPoints = [
				[100, 100],
				[100, 0],
				[0, 0],
				[0, 100],
				[30, 100],
				[50, 120],
				[70, 100],
			];

			expect(HttpService.JSONEncode(resultPolygon.regions[0])).to.equal(
				HttpService.JSONEncode(expectedResultPoints),
			);
		});

		it("should cut lines from M shape polygon", () => {
			const polygon = simpleMShape();

			const newPolygon = setIntersectionPoints(polygon, cutLineFromMShape);

			const expectedPoints = [
				[30, 30],
				[20, 20],
				[10, 30],
			];

			expect(HttpService.JSONEncode(newPolygon?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));

			const resultPolygon = calculatePolygonOperation(polygon, newPolygon as Polygon, "Union");

			const expectedResultPoints = [
				[40, 40],
				[40, 0],
				[0, 0],
				[0, 40],
				[10, 30],
				[30, 30],
			];
			expect(HttpService.JSONEncode(resultPolygon.regions[0])).to.equal(
				HttpService.JSONEncode(expectedResultPoints),
			);
		});

		it("should cut U shape from rectangle polygon", () => {
			const polygon = simpleRect();

			const points: Point[] = [
				[40, 100],
				[40, 110],
				[60, 110],
				[60, 100],
			];

			const newPolygon = setIntersectionPoints(polygon, points);
			const expectedPoints = [
				[60, 100],
				[40, 100],
				[40, 110],
				[60, 110],
			];
			expect(HttpService.JSONEncode(newPolygon?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));

			const resultPolygon = calculatePolygonOperation(polygon, newPolygon as Polygon, "Union");

			// **********
			// **********
			//     **
			const expectedResultPoints = [
				[100, 100],
				[100, 0],
				[0, 0],
				[0, 100],
				[40, 100],
				[40, 110],
				[60, 110],
				[60, 100],
			];
			expect(HttpService.JSONEncode(resultPolygon.regions[0])).to.equal(
				HttpService.JSONEncode(expectedResultPoints),
			);
		});

		it("should cut U shape from rectangle with U already cut out", () => {
			const polygon = uShapedPolygon();

			const points = uShapePoints;

			const newPolygon = setIntersectionPoints(polygon, points);
			const expectedPoints = [
				[60, 10],
				[50, 10],
				[40, 20],
				[30, 20],
				[20, 10],
				[10, 10],
				[30, 30],
				[40, 30],
			];

			expect(HttpService.JSONEncode(newPolygon?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));

			const resultPolygon = calculatePolygonOperation(polygon, newPolygon as Polygon, "Union");

			const expectedResultPoints = [
				[70, 10],
				[70, 0],
				[0, 0],
				[0, 10],
				[10, 10],
				[30, 30],
				[40, 30],
				[60, 10],
			];

			expect(HttpService.JSONEncode(resultPolygon.regions[0])).to.equal(
				HttpService.JSONEncode(expectedResultPoints),
			);
		});

		it("should extend lines and find intersections", () => {
			const polygon = verySimpleRect();

			const cutLine: Point[] = [
				[1, 4],
				[1, 5],
				[3, 5],
				[3, 4],
			];

			const result = setIntersectionPoints(polygon, cutLine);

			const expectedPoints = [
				[3, 3],
				[1, 3],
				[1, 5],
				[3, 5],
			];

			expect(HttpService.JSONEncode(result?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));
		});

		it("should extend one line and find intersections", () => {
			const polygon = verySimpleRect();

			const cutLine: Point[] = [
				[1, 4],
				[1, 5],
				[3, 5],
				[3, 2],
			];

			const result = setIntersectionPoints(polygon, cutLine);

			const expectedPoints = [
				[3, 3],
				[1, 3],
				[1, 5],
				[3, 5],
			];

			expect(HttpService.JSONEncode(result?.regions[0])).to.equal(HttpService.JSONEncode(expectedPoints));
		});
	});
};

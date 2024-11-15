import polybool, { PointShape, Polygon } from "shared/polybool/polybool";

import { PolygonOperation } from "./PolygonClipper.types";

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

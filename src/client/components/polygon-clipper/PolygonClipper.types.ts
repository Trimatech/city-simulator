import { Polygon } from "shared/polybool/polybool";

export interface PolygonState {
	poly1: Polygon;
	poly2: Polygon;
	result: Polygon;
}

export type PolygonOperation = "Intersect" | "Union" | "Difference" | "DifferenceRev" | "Xor";

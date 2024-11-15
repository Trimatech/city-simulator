import { Polygon } from "shared/polybool/polybool";

import { DemoPolygon } from "./demo-cases";

export interface PolygonState {
	demo: DemoPolygon;
	result: Polygon;
}

export type PolygonOperation = "Intersect" | "Union" | "Difference" | "DifferenceRev" | "Xor";

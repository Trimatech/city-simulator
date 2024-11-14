import { Polygon } from "shared/polybool/polybool";

interface DemoPolygon {
	name: string;
	poly1: Polygon;
	poly2: Polygon;
}

export const demoPolygons: DemoPolygon[] = [
	{
		name: "Triple overlap",
		poly1: {
			regions: [
				[
					[500, 60],
					[500, 150],
					[320, 150],
					[260, 210],
					[200, 150],
					[200, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[500, 60],
					[500, 150],
					[370, 60],
					[310, 60],
					[400, 180],
					[230, 60],
				],
				[
					[260, 60],
					[410, 60],
					[310, 160],
					[310, 210],
					[260, 170],
					[240, 190],
				],
			],
			inverted: false,
		},
	},
];

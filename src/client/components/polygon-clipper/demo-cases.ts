import { Point, Polygon, Vec6 } from "shared/polybool/polybool";

export interface DemoPolygon {
	name: string;
	poly1?: Polygon;
	poly2?: Polygon;
	shape1?: (Point | Vec6)[][];
	shape2?: (Point | Vec6)[][];
	shape1Open?: number[];
	shape2Open?: number[];
}

export const demoPolygons: DemoPolygon[] = [
	{
		name: "Assorted Polygons",
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
					[460, 190],
					[460, 110],
					[400, 180],
					[160, 90],
				],
				[
					[220, 170],
					[260, 30],
					[310, 160],
					[310, 210],
					[260, 170],
					[240, 190],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Curved Leg",
		shape1: [
			[
				[190, 50],
				[530, 50],
				[530, 170],
				[190, 170],
			],
		],
		shape2: [
			[
				[330, 130],
				[230, 130, 290, 170, 190, 170],
				[470, 170],
				[470, 130],
			],
		],
	},
	{
		name: "Open Paths",
		shape1: [
			[
				[540, 60],
				[540, 180],
				[420, 180],
				[420, 60],
			],
			[
				[130, 160],
				[350, 60],
				[560, 160],
			],
		],
		shape1Open: [1],
		shape2: [
			[
				[280, 60],
				[280, 180],
				[150, 180],
				[150, 60],
			],
			[
				[130, 80],
				[280, 180, 420, 180, 560, 80],
			],
		],
		shape2Open: [1],
	},
	{
		name: "Curved Shapes 1",
		poly1: {
			regions: [
				[
					[450, 150],
					[200, 150, 200, 60, 450, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[500, 150],
					[380, 150, 380, 60, 500, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Curved Shapes 2",
		shape1: [
			[
				[410, 160],
				[200, 150, 200, 60, 450, 60],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 3",
		shape1: [
			[
				[450, 100],
				[200, 150, 200, 60, 450, 60],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 4",
		shape1: [
			[
				[340, 150],
				[200, 150, 200, 60, 450, 60],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 5",
		shape1: [
			[
				[460, 70],
				[200, 150, 200, 60, 450, 60],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 6",
		shape1: [
			[
				[450, 80],
				[200, 150, 200, 60, 450, 10],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 7",
		shape1: [
			[
				[450, 120],
				[200, 150, 200, 60, 450, 60],
			],
		],
		shape2: [
			[
				[500, 150],
				[380, 150, 380, 60, 500, 60],
			],
		],
	},
	{
		name: "Curved Shapes 8",
		poly1: {
			regions: [
				[
					[450, 150],
					[200, 150, 200, 60, 450, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[500, 150],
					[380, 150, 380, 60, 380, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Curved Shapes 9",
		poly1: {
			regions: [
				[
					[290, 150],
					[200, 150, 200, 60, 270, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[290, 150],
					[380, 150, 380, 60, 290, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Curved Shapes 10",
		poly1: {
			regions: [
				[
					[450, 150],
					[200, 150, 200, 60, 450, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[510, 140],
					[380, 150, 290, 130, 240, 20],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Curve + Line 1",
		shape1: [
			[
				[600, 60],
				[600, 150],
				[560, 190],
				[560, 110],
				[500, 180],
				[260, 90],
			],
		],
		shape2: [
			[
				[400, 50],
				[400, 150, 200, 200, 200, 50],
			],
		],
	},
	{
		name: "Curve + Line 2",
		shape1: [
			[
				[600, 60],
				[600, 150],
				[560, 190],
				[560, 110],
				[500, 180],
				[360, 110],
			],
		],
		shape2: [
			[
				[400, 50],
				[400, 150, 200, 200, 200, 50],
			],
		],
	},
	{
		name: "Curve + Line 3",
		shape1: [
			[
				[600, 60],
				[600, 150],
				[560, 190],
				[560, 110],
				[500, 180],
				[270, 130],
			],
		],
		shape2: [
			[
				[400, 50],
				[400, 150, 200, 200, 200, 50],
			],
		],
	},
	{
		name: "Curve + Line 4",
		shape1: [
			[
				[600, 60],
				[600, 150],
				[560, 190],
				[560, 110],
				[500, 180],
				[240, 160],
			],
		],
		shape2: [
			[
				[400, 50],
				[400, 150, 200, 200, 200, 50],
			],
		],
	},
	{
		name: "Curve + Line 5",
		shape1: [
			[
				[600, 60],
				[600, 150],
				[560, 190],
				[560, 110],
				[500, 180],
				[380, 120],
			],
		],
		shape2: [
			[
				[400, 50],
				[400, 150, 200, 200, 200, 50],
			],
		],
	},
	{
		name: "Simple Rectangles",
		shape1: [
			[
				[200, 50],
				[600, 50],
				[600, 150],
				[200, 150],
			],
		],
		shape2: [
			[
				[300, 150],
				[500, 150],
				[500, 200],
				[300, 200],
			],
		],
	},
	{
		name: "Shared Right Edge",
		poly1: {
			regions: [
				[
					[500, 60],
					[500, 150],
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
					[450, 230],
					[400, 180],
					[590, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Simple Boxes",
		poly1: {
			regions: [
				[
					[500, 60],
					[500, 150],
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
					[380, 150],
					[380, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Simple Self-Overlap",
		poly1: {
			regions: [
				[
					[200, 50],
					[400, 50],
					[400, 150],
					[200, 150],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[400, 150],
					[500, 150],
					[300, 50],
					[400, 50],
				],
			],
			inverted: false,
		},
	},
	{
		name: "M Shape",
		poly1: {
			regions: [
				[
					[570, 60],
					[570, 150],
					[60, 150],
					[60, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[500, 60],
					[500, 130],
					[330, 20],
					[180, 130],
					[120, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Two Triangles With Common Edge",
		poly1: {
			regions: [
				[
					[620, 60],
					[620, 150],
					[90, 150],
					[90, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[350, 60],
					[480, 200],
					[180, 60],
				],
				[
					[180, 60],
					[500, 60],
					[180, 220],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Two Trianges With Common Edge, pt. 2",
		poly1: {
			regions: [
				[
					[620, 60],
					[620, 150],
					[90, 150],
					[90, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[400, 60],
					[270, 120],
					[210, 60],
				],
				[
					[210, 60],
					[530, 60],
					[210, 220],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Two Triangles With Common Edge, pt. 3",
		poly1: {
			regions: [
				[
					[620, 60],
					[620, 150],
					[90, 150],
					[90, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[370, 60],
					[300, 220],
					[560, 60],
				],
				[
					[180, 60],
					[500, 60],
					[180, 220],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Three Triangles",
		poly1: {
			regions: [
				[
					[500, 60],
					[500, 150],
					[320, 150],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[500, 60],
					[500, 150],
					[460, 190],
				],
				[
					[220, 170],
					[260, 30],
					[310, 160],
				],
				[
					[260, 210],
					[200, 150],
					[200, 60],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Adjacent Edges in Status",
		poly1: {
			regions: [
				[
					[620, 60],
					[620, 150],
					[90, 150],
					[90, 60],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[110, 60],
					[420, 230],
					[540, 60],
				],
				[
					[180, 60],
					[430, 160],
					[190, 200],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Coincident Self-Intersection",
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
					[460, 190],
					[460, 110],
					[400, 180],
					[70, 90],
				],
				[
					[220, 170],
					[580, 130],
					[310, 160],
					[310, 210],
					[260, 170],
					[240, 190],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Coincident Self-Intersection, pt. 2",
		poly1: {
			regions: [
				[
					[100, 100],
					[200, 200],
					[300, 100],
				],
				[
					[200, 100],
					[300, 200],
					[400, 100],
				],
			],
			inverted: false,
		},
		poly2: {
			regions: [
				[
					[50, 50],
					[200, 50],
					[300, 150],
				],
			],
			inverted: false,
		},
	},
	{
		name: "Triple Overlap",
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

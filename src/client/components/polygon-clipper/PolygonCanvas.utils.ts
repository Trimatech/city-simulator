import { Point, PointShape } from "shared/polybool/Geometry";
import { Polygon } from "shared/polybool/polybool";

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

import { Point, PointShape } from "shared/polybool/Geometry";
import { Polygon } from "shared/polybool/polybool";
import { PolygonState } from "./PolygonClipper.types";
import { DemoPolygon } from "./demo-cases";

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
	isPoly1: boolean;
	regionIndex: number;
	pointIndex: number;
	distance: number;
}

export function findClosestPoint(
	canvasHeight: number,
	framePosition: Vector2,
	mousePos: Vector3,
	poly1: Polygon,
	poly2: Polygon,
) {
	let closestDist = math.huge;
	let closest: ClosestPointResult | undefined;
	// warn(`checking ${polyName} r${regionIndex} p${pointIndex}=${point[0]}_${point[1]}`);

	const mouseX = mousePos.X - framePosition.X;
	const mouseY = mousePos.Y - framePosition.Y;
	// warn(`.... mouse x=${mouseX}, y=${mouseY}`);

	const setClosestIfCloser = (point: PointShape, isPoly1: boolean, regionIndex: number, pointIndex: number) => {
		const dist = math.sqrt(math.pow(mouseX - point[0], 2) + math.pow(canvasHeight - mouseY - point[1], 2));
		if (dist < closestDist && dist < 10) {
			// 10 is hit radius
			closestDist = dist;
			closest = { isPoly1, regionIndex, pointIndex, distance: dist };
		}
	};

	poly1.regions.forEach((region, regionIndex) => {
		region.forEach((point, pointIndex) => {
			setClosestIfCloser(point, true, regionIndex, pointIndex);
		});
	});

	poly2.regions.forEach((region, regionIndex) => {
		region.forEach((point, pointIndex) => {
			setClosestIfCloser(point, false, regionIndex, pointIndex);
		});
	});

	return closest;
}

export function calculateSnappedPosition(input: InputObject, rbx: Frame, canvasHeight: number, snap: boolean) {
	const position = input.Position;
	const framePosition = rbx.AbsolutePosition;
	const mouseX = position.X - framePosition.X;
	const mouseY = position.Y - framePosition.Y;
	const newPos: Point = [mouseX, canvasHeight - mouseY];
	return snap ? snapToGrid(newPos) : newPos;
}

export const updatePolygonPoint = (params: {
	input: InputObject;
	rbx: Frame;
	canvasHeight: number;
	snap: boolean;
	isPoly1: boolean;
	regionIndex: number;
	pointIndex: number;
	poly1: Polygon;
	poly2: Polygon;
}) => {
	const { input, rbx, canvasHeight, snap, isPoly1, regionIndex, pointIndex, poly1, poly2 } = params;
	const snappedPos = calculateSnappedPosition(input, rbx, canvasHeight, snap);

	const changedPolygon = isPoly1 ? poly1 : poly2;
	changedPolygon.regions[regionIndex][pointIndex] = snappedPos;
	return changedPolygon;
};

export function getNextRegion(region: PointShape[], i: number) {
	return region[(i + 1) % region.size()] as Point;
}

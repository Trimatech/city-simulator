import { Point } from "shared/polybool/Geometry";
import { Polygon } from "shared/polybool/polybool";
import { PolygonState } from "./PolygonClipper.types";

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

export function findClosestPoint(point: Point, state: PolygonState) {
	let closestDistance = math.huge;
	let result:
		| {
				polygon: "poly1" | "poly2";
				regionIndex: number;
				pointIndex: number;
				distance: number;
		  }
		| undefined;

	["poly1", "poly2"].forEach((polyName) => {
		state[polyName as keyof PolygonState].regions.forEach((region, regionIndex) => {
			region.forEach((p, pointIndex) => {
				const distance = math.sqrt(math.pow(point[0] - p[0], 2) + math.pow(point[1] - p[1], 2));
				if (distance < closestDistance) {
					closestDistance = distance;
					result = {
						polygon: polyName as "poly1" | "poly2",
						regionIndex,
						pointIndex,
						distance,
					};
				}
			});
		});
	});

	return result;
}

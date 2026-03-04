import { fillArray } from "./utils/object-utils";

export const createPolygonAroundPosition = (position: Vector2, diameter: number, items: number) => {
	print("Create polygon to head:", position);
	const radius = diameter / 2;
	return fillArray(items, (index) => {
		const angle = (index / items) * (2 * math.pi);
		return position.add(new Vector2(math.cos(angle) * radius, math.sin(angle) * radius));
	});
};

export const calculatePolygonArea = (polygon: readonly Vector2[]) => {
	let area = 0;
	const length = polygon.size();

	if (length < 3) return 0;

	for (let i = 0; i < length; i++) {
		const j = (i + 1) % length;
		area += polygon[i].X * polygon[j].Y;
		area -= polygon[j].X * polygon[i].Y;
	}

	return math.round(math.abs(area) / 2);
};

export function createRectanglePolygon(center: Vector2, halfWidth: number, halfHeight: number): Vector2[] {
	return [
		center.add(new Vector2(-halfWidth, -halfHeight)),
		center.add(new Vector2(halfWidth, -halfHeight)),
		center.add(new Vector2(halfWidth, halfHeight)),
		center.add(new Vector2(-halfWidth, halfHeight)),
	];
}

export function getPolygonCentroid(polygon: readonly Vector2[]): Vector2 | undefined {
	if (polygon.size() < 3) return undefined;
	let sumX = 0;
	let sumY = 0;
	for (const p of polygon) {
		sumX += p.X;
		sumY += p.Y;
	}
	const n = polygon.size();
	return new Vector2(sumX / n, sumY / n);
}

export function scalePolygonFromCentroid(polygon: readonly Vector2[], factor: number): Vector2[] {
	if (polygon.size() < 3) return [...polygon];

	let sumX = 0;
	let sumY = 0;
	for (const p of polygon) {
		sumX += p.X;
		sumY += p.Y;
	}
	const n = polygon.size();
	const centroid = new Vector2(sumX / n, sumY / n);

	return polygon.map((p) => {
		const delta = p.sub(centroid);
		return centroid.add(delta.mul(factor));
	});
}

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

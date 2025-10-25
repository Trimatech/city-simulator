export function getCellBounds(position: Vector2, resolution: number): RectBounds {
	const cellX = math.floor(position.X / resolution);
	const cellY = math.floor(position.Y / resolution);
	const minX = cellX * resolution;
	const minY = cellY * resolution;
	const maxX = minX + resolution;
	const maxY = minY + resolution;
	return { minX, minY, maxX, maxY };
}

export function isPointInsideRect(p: Vector2, minX: number, minY: number, maxX: number, maxY: number) {
	return p.X >= minX && p.X <= maxX && p.Y >= minY && p.Y <= maxY;
}

export function segmentsIntersect(p1: Vector2, p2: Vector2, q1: Vector2, q2: Vector2) {
	const s1x = p2.X - p1.X;
	const s1y = p2.Y - p1.Y;
	const s2x = q2.X - q1.X;
	const s2y = q2.Y - q1.Y;

	const denom = -s2x * s1y + s1x * s2y;
	if (denom === 0) return false;

	const s = (-s1y * (p1.X - q1.X) + s1x * (p1.Y - q1.Y)) / denom;
	const t = (s2x * (p1.Y - q1.Y) - s2y * (p1.X - q1.X)) / denom;

	return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

export function segmentIntersectsRect(a: Vector2, b: Vector2, minX: number, minY: number, maxX: number, maxY: number) {
	if (isPointInsideRect(a, minX, minY, maxX, maxY) || isPointInsideRect(b, minX, minY, maxX, maxY)) {
		return true;
	}

	const tl = new Vector2(minX, minY);
	const tr = new Vector2(maxX, minY);
	const br = new Vector2(maxX, maxY);
	const bl = new Vector2(minX, maxY);

	if (segmentsIntersect(a, b, tl, tr)) return true;
	if (segmentsIntersect(a, b, tr, br)) return true;
	if (segmentsIntersect(a, b, br, bl)) return true;
	if (segmentsIntersect(a, b, bl, tl)) return true;

	return false;
}

export function vectorsEqual(a: Vector2, b: Vector2) {
	return a.X === b.X && a.Y === b.Y;
}

export function filterTracersForCell(tracers: Vector2[], positionInCell: Vector2, resolution: number) {
	const { minX, minY, maxX, maxY } = getCellBounds(positionInCell, resolution);
	const filtered: Vector2[] = [];

	for (let i = 0; i < tracers.size() - 1; i++) {
		const a = tracers[i];
		const b = tracers[i + 1];

		if (!segmentIntersectsRect(a, b, minX, minY, maxX, maxY)) {
			continue;
		}

		if (filtered.size() === 0 || !vectorsEqual(filtered[filtered.size() - 1], a)) {
			filtered.push(a);
		}
		filtered.push(b);
	}

	return filtered;
}

export interface RectBounds {
	readonly minX: number;
	readonly minY: number;
	readonly maxX: number;
	readonly maxY: number;
}

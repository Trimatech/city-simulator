export function quantizeVector2(v: Vector2, q = 0.01): Vector2 {
	if (q <= 0) return v;
	const x = math.floor(v.X / q + 0.5) * q;
	const y = math.floor(v.Y / q + 0.5) * q;
	return new Vector2(x, y);
}

export function getEdgeId({ a, b }: { a: Vector2; b: Vector2 }, q = 0.01): string {
	const qa = quantizeVector2(a, q);
	const qb = quantizeVector2(b, q);
	const swap = qb.X < qa.X || (qb.X === qa.X && qb.Y < qa.Y);
	const k1 = swap ? qb : qa;
	const k2 = swap ? qa : qb;
	return `${k1.X}_${k1.Y}_${k2.X}_${k2.Y}`;
}

export interface EdgeRef {
	a: Vector2;
	b: Vector2;
}

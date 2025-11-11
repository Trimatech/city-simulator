export interface GridLine {
	readonly a: Vector2;
	readonly b: Vector2;
	readonly ownerId: string;
	readonly kind: "tracer" | "area" | "area2";
	/**
	 * Dimensionless factor to multiply with thickness to extend the part length at 'a' endpoint.
	 * Recommended extension in studs: thickness * startMiterFactor
	 */
	readonly startMiterFactor?: number;
	/**
	 * Dimensionless factor to multiply with thickness to extend the part length at 'b' endpoint.
	 * Recommended extension in studs: thickness * endMiterFactor
	 */
	readonly endMiterFactor?: number;
	/**
	 * Unit direction vectors (2D) for neighboring edges at each endpoint, pointing
	 * away from the corner along the neighboring segment. Optional and only set for area lines.
	 */
	readonly startNeighborDir?: Vector2;
	readonly endNeighborDir?: Vector2;
}

export interface GridCellsByEdgeId {
	readonly [edgeId: string]: GridLine | undefined;
}

export interface GridState {
	readonly resolution: number;
	readonly cells: { readonly [cellKey: string]: GridCellsByEdgeId | undefined };
}

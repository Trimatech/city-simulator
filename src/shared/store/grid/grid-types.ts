export interface GridLine {
	readonly a: Vector2;
	readonly b: Vector2;
	readonly ownerId: string;
	readonly kind: "tracer" | "area";
}

export interface GridCellsByEdgeId {
	readonly [edgeId: string]: GridLine | undefined;
}

export interface GridState {
	readonly resolution: number;
	readonly cells: { readonly [cellKey: string]: GridCellsByEdgeId | undefined };
}

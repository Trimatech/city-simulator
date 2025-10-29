export function getCellCoordFromPos(pos: Vector2, res: number): Vector2 {
	const x = math.floor(pos.X / res);
	const y = math.floor(pos.Y / res);
	return new Vector2(x, y);
}

export function getCellKeyFromCoord(coord: Vector2): string {
	return `${coord.X},${coord.Y}`;
}

export function getCellKeyFromPos(pos: Vector2, res: number): string {
	return getCellKeyFromCoord(getCellCoordFromPos(pos, res));
}

export function iterateCellsInAABB(min: Vector2, max: Vector2, res: number): string[] {
	const minC = getCellCoordFromPos(min, res);
	const maxC = getCellCoordFromPos(max, res);
	const keys = new Array<string>();
	for (const i of $range(minC.X, maxC.X)) {
		for (const j of $range(minC.Y, maxC.Y)) {
			keys.push(getCellKeyFromCoord(new Vector2(i, j)));
		}
	}
	return keys;
}

export function getCellAABBFromCoord(coord: Vector2, res: number): [Vector2, Vector2] {
	const min = new Vector2(coord.X * res, coord.Y * res);
	const max = new Vector2((coord.X + 1) * res, (coord.Y + 1) * res);
	return [min, max];
}

export function iterateCellsAroundCoord(centerCoord: Vector2, halfWidthCells: number): string[] {
	const hw = math.max(0, halfWidthCells);
	const keys = new Array<string>();
	for (const ix of $range(centerCoord.X - hw, centerCoord.X + hw)) {
		for (const iy of $range(centerCoord.Y - hw, centerCoord.Y + hw)) {
			keys.push(getCellKeyFromCoord(new Vector2(ix, iy)));
		}
	}
	return keys;
}

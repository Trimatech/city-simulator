/**
 * BlockMap — a 2D density/value map at reduced resolution.
 *
 * Used for pollution, land value, crime, traffic density, fire coverage,
 * police coverage, population density, and other overlay layers.
 *
 * Each block covers a `blockSize × blockSize` region of the tile map.
 */
export class BlockMap {
	public readonly data: number[];
	public readonly width: number;
	public readonly height: number;
	public readonly blockSize: number;

	constructor(gameMapWidth: number, gameMapHeight: number, blockSize: number) {
		this.blockSize = blockSize;
		this.width = math.ceil(gameMapWidth / blockSize);
		this.height = math.ceil(gameMapHeight / blockSize);
		this.data = table.create(this.width * this.height, 0);
	}

	// ── Block-coordinate accessors ─────────────────────────────────────

	/** Get a value using block coordinates. Returns 0 for out-of-bounds. */
	public get(bx: number, by: number): number {
		if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) return 0;
		return this.data[by * this.width + bx];
	}

	/** Set a value using block coordinates. No-op for out-of-bounds. */
	public set(bx: number, by: number, value: number): void {
		if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) return;
		this.data[by * this.width + bx] = value;
	}

	// ── World (tile) coordinate accessors ──────────────────────────────

	/** Get the block value that covers the given tile coordinate. */
	public worldGet(wx: number, wy: number): number {
		return this.get(math.floor(wx / this.blockSize), math.floor(wy / this.blockSize));
	}

	/** Set the block value that covers the given tile coordinate. */
	public worldSet(wx: number, wy: number, value: number): void {
		this.set(math.floor(wx / this.blockSize), math.floor(wy / this.blockSize), value);
	}

	// ── Utilities ──────────────────────────────────────────────────────

	/** Reset every cell to 0. */
	public clear(): void {
		for (let i = 0; i < this.data.size(); i++) {
			this.data[i] = 0;
		}
	}
}

import { MAP_HEIGHT, MAP_TOTAL_TILES, MAP_WIDTH } from "shared/constants/core";
import { DIRT, LOMASK, POWERBIT } from "./tile-values";

export interface TileDelta {
	readonly x: number;
	readonly y: number;
	readonly tile: number;
}

export class TileMap {
	public readonly data: number[];
	private readonly dirty = new Set<number>();

	constructor() {
		this.data = table.create(MAP_TOTAL_TILES, DIRT);
	}

	/** Get the raw 16-bit tile value at (x, y). Returns DIRT for out-of-bounds. */
	public get(x: number, y: number): number {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return DIRT;
		return this.data[y * MAP_WIDTH + x];
	}

	/** Set the raw 16-bit tile value at (x, y) and mark dirty. */
	public set(x: number, y: number, tile: number): void {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
		const idx = y * MAP_WIDTH + x;
		if (this.data[idx] !== tile) {
			this.data[idx] = tile;
			this.dirty.add(idx);
		}
	}

	/** Get just the tile type (low 10 bits). */
	public getTileType(x: number, y: number): number {
		return this.get(x, y) & LOMASK;
	}

	/** Set a tile value without marking dirty (for initial loading). */
	public setRaw(x: number, y: number, tile: number): void {
		if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return;
		this.data[y * MAP_WIDTH + x] = tile;
	}

	/** Clear the powered bit from all tiles. */
	public clearPowerBits(): void {
		for (let i = 0; i < MAP_TOTAL_TILES; i++) {
			this.data[i] = this.data[i] & ~POWERBIT;
		}
	}

	/** Flush dirty tiles and return deltas. Clears dirty set. */
	public flushDirty(): TileDelta[] {
		const deltas: TileDelta[] = [];
		this.dirty.forEach((idx) => {
			const x = idx % MAP_WIDTH;
			const y = math.floor(idx / MAP_WIDTH);
			deltas.push({ x, y, tile: this.data[idx] });
		});
		this.dirty.clear();
		return deltas;
	}

	/** Check if any tiles are dirty. */
	public isDirty(): boolean {
		return this.dirty.size() > 0;
	}

	/** Serialize entire map to a flat number array for initial hydration. */
	public serialize(): number[] {
		return table.clone(this.data);
	}

	/** Load from a flat number array (initial hydration). */
	public deserialize(data: number[]): void {
		for (let i = 0; i < MAP_TOTAL_TILES; i++) {
			this.data[i] = data[i] ?? DIRT;
		}
		this.dirty.clear();
	}

	/** Total number of tiles matching a predicate. */
	public count(predicate: (tile: number) => boolean): number {
		let c = 0;
		for (let i = 0; i < MAP_TOTAL_TILES; i++) {
			if (predicate(this.data[i])) c++;
		}
		return c;
	}
}

import { MAP_HEIGHT, MAP_TOTAL_TILES, MAP_WIDTH } from "shared/constants/core";
import { TileDelta, TileMap } from "shared/simulation/tile-map";
import { DIRT, LOMASK } from "shared/simulation/tile-values";
import { remotes } from "shared/remotes";

/**
 * Client-side tile map that mirrors the server state.
 * Receives full hydration on join, then incremental deltas each tick.
 */
export class TileMapClient {
	public readonly map = new TileMap();
	public readonly dirtyChunks = new Set<number>();

	private hydrated = false;
	private readonly onUpdate: () => void;

	constructor(onUpdate: () => void) {
		this.onUpdate = onUpdate;

		// Listen for initial map hydration
		remotes.city.hydrateMap.connect((mapData) => {
			this.map.deserialize(mapData);
			this.hydrated = true;
			// Mark all chunks as dirty for initial render
			const chunksX = math.ceil(MAP_WIDTH / 10);
			const chunksY = math.ceil(MAP_HEIGHT / 10);
			for (let i = 0; i < chunksX * chunksY; i++) {
				this.dirtyChunks.add(i);
			}
			this.onUpdate();
		});

		// Listen for incremental tile deltas
		remotes.city.applyDeltas.connect((deltas) => {
			for (const delta of deltas) {
				this.map.setRaw(delta.x, delta.y, delta.tile);
				// Calculate which chunk this tile belongs to
				const chunkX = math.floor(delta.x / 10);
				const chunkY = math.floor(delta.y / 10);
				const chunksX = math.ceil(MAP_WIDTH / 10);
				this.dirtyChunks.add(chunkY * chunksX + chunkX);
			}
			this.onUpdate();
		});
	}

	public isHydrated(): boolean {
		return this.hydrated;
	}

	public flushDirtyChunks(): number[] {
		const chunks: number[] = [];
		this.dirtyChunks.forEach((chunkId) => chunks.push(chunkId));
		this.dirtyChunks.clear();
		return chunks;
	}
}

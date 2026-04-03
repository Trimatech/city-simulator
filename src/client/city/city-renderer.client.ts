import { ChunkManager } from "./chunk-manager";
import { TileMapClient } from "./tile-map-client";

const chunkManager = new ChunkManager();

const tileMapClient = new TileMapClient(() => {
	// Called whenever tile map changes (hydration or deltas)
	const dirtyChunks = tileMapClient.flushDirtyChunks();
	if (dirtyChunks.size() > 0) {
		chunkManager.renderChunks(dirtyChunks, tileMapClient.map);
	}
});

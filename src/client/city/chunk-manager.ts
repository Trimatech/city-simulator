import { Workspace } from "@rbxts/services";
import { CHUNK_SIZE, CHUNKS_X, CHUNKS_Y, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "shared/constants/core";
import { DIRT, LOMASK } from "shared/simulation/tile-values";
import { TileMap } from "shared/simulation/tile-map";

import { getTileMeshProps } from "./tile-mesh-factory";

const GROUND_Y = 0;

/**
 * Manages 3D Part rendering for the tile map, organized into chunks.
 * Each chunk is a Folder containing Parts for its tiles.
 */
export class ChunkManager {
	private readonly rootFolder: Folder;
	private readonly chunks: (Folder | undefined)[] = [];
	private readonly parts: Map<number, Part> = new Map();

	constructor() {
		this.rootFolder = new Instance("Folder");
		this.rootFolder.Name = "CityTiles";
		this.rootFolder.Parent = Workspace;
	}

	/** Render or re-render all tiles in the given chunks. */
	public renderChunks(dirtyChunkIds: number[], tileMap: TileMap): void {
		for (const chunkId of dirtyChunkIds) {
			this.renderChunk(chunkId, tileMap);
		}
	}

	/** Render all chunks (initial full render). */
	public renderAll(tileMap: TileMap): void {
		for (let i = 0; i < CHUNKS_X * CHUNKS_Y; i++) {
			this.renderChunk(i, tileMap);
		}
	}

	private renderChunk(chunkId: number, tileMap: TileMap): void {
		const chunkX = chunkId % CHUNKS_X;
		const chunkY = math.floor(chunkId / CHUNKS_X);

		// Get or create chunk folder
		let folder = this.chunks[chunkId];
		if (!folder) {
			folder = new Instance("Folder");
			folder.Name = `Chunk_${chunkX}_${chunkY}`;
			folder.Parent = this.rootFolder;
			this.chunks[chunkId] = folder;
		}

		const startX = chunkX * CHUNK_SIZE;
		const startY = chunkY * CHUNK_SIZE;
		const endX = math.min(startX + CHUNK_SIZE, MAP_WIDTH);
		const endY = math.min(startY + CHUNK_SIZE, MAP_HEIGHT);

		for (let y = startY; y < endY; y++) {
			for (let x = startX; x < endX; x++) {
				const tileValue = tileMap.get(x, y);
				const tileIdx = y * MAP_WIDTH + x;
				const props = getTileMeshProps(tileValue);

				let part = this.parts.get(tileIdx);
				if (!part) {
					part = new Instance("Part");
					part.Anchored = true;
					part.CanCollide = true;
					part.CanQuery = true;
					part.Name = `Tile_${x}_${y}`;
					part.TopSurface = Enum.SurfaceType.Smooth;
					part.BottomSurface = Enum.SurfaceType.Smooth;
					part.Parent = folder;
					this.parts.set(tileIdx, part);

					// Store tile coords as attributes for raycasting
					part.SetAttribute("TileX", x);
					part.SetAttribute("TileY", y);
				}

				// Update visual properties
				part.Color = props.color;
				part.Material = props.material;
				part.Transparency = props.transparency;
				part.Size = new Vector3(TILE_SIZE, props.height, TILE_SIZE);
				part.Position = new Vector3(
					x * TILE_SIZE + TILE_SIZE / 2,
					GROUND_Y + props.height / 2,
					y * TILE_SIZE + TILE_SIZE / 2,
				);
			}
		}
	}

	/** Clean up all parts. */
	public destroy(): void {
		this.rootFolder.Destroy();
		this.parts.clear();
	}
}

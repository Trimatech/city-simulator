import { Workspace } from "@rbxts/services";
import { CHUNK_SIZE, CHUNKS_X, CHUNKS_Y, MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "shared/constants/core";
import { TileMap } from "shared/simulation/tile-map";

import { getTileMeshProps, type TileMeshProps } from "./tile-mesh-factory";

const GROUND_Y = 0;
const LABEL_COLORS: Map<string, Color3> = new Map([
	["Residential", Color3.fromRGB(76, 175, 80)],
	["Commercial", Color3.fromRGB(33, 150, 243)],
	["Industrial", Color3.fromRGB(255, 193, 7)],
	["Coal Power", Color3.fromRGB(180, 180, 180)],
	["Nuclear Power", Color3.fromRGB(255, 235, 59)],
	["Fire Dept", Color3.fromRGB(244, 67, 54)],
	["Police Dept", Color3.fromRGB(130, 150, 255)],
	["Seaport", Color3.fromRGB(100, 220, 210)],
	["Airport", Color3.fromRGB(200, 200, 200)],
	["Stadium", Color3.fromRGB(200, 130, 220)],
]);

function getLabelColor(label: string): Color3 {
	// Check for level-based labels like "Residential Lv.2"
	for (const [key, color] of LABEL_COLORS) {
		if (label.sub(1, key.size()) === key) return color;
	}
	return Color3.fromRGB(220, 220, 220);
}

/**
 * Manages 3D Part rendering for the tile map, organized into chunks.
 * Buildings (zone centers) are rendered as Models with BillboardGui labels.
 */
export class ChunkManager {
	private readonly rootFolder: Folder;
	private readonly chunks: (Folder | undefined)[] = [];
	private readonly parts: Map<number, Part> = new Map();
	private readonly labels: Map<number, BillboardGui> = new Map();

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

				// Handle building labels
				this.updateLabel(tileIdx, part, props);
			}
		}
	}

	private updateLabel(tileIdx: number, part: Part, props: TileMeshProps): void {
		const existingLabel = this.labels.get(tileIdx);

		if (props.buildingLabel !== undefined) {
			if (existingLabel) {
				// Update existing label text & position
				const textLabel = existingLabel.FindFirstChild("Label") as TextLabel | undefined;
				if (textLabel) {
					textLabel.Text = props.buildingLabel;
					textLabel.TextColor3 = getLabelColor(props.buildingLabel);
				}
				existingLabel.StudsOffset = new Vector3(0, props.height / 2 + 1.5, 0);
			} else {
				// Create new BillboardGui label
				const billboard = new Instance("BillboardGui");
				billboard.Name = "BuildingLabel";
				billboard.Size = new UDim2(0, 100, 0, 36);
				billboard.StudsOffset = new Vector3(0, props.height / 2 + 1.5, 0);
				billboard.AlwaysOnTop = true;
				billboard.MaxDistance = 150;
				billboard.LightInfluence = 0;
				billboard.Adornee = part;

				// Background panel
				const bg = new Instance("Frame");
				bg.Name = "BG";
				bg.Size = new UDim2(1, 0, 1, 0);
				bg.BackgroundColor3 = Color3.fromRGB(20, 20, 26);
				bg.BackgroundTransparency = 0.25;
				bg.BorderSizePixel = 0;
				bg.Parent = billboard;

				const corner = new Instance("UICorner");
				corner.CornerRadius = new UDim(0, 4);
				corner.Parent = bg;

				const stroke = new Instance("UIStroke");
				stroke.Color = getLabelColor(props.buildingLabel);
				stroke.Thickness = 1;
				stroke.Transparency = 0.5;
				stroke.Parent = bg;

				const padding = new Instance("UIPadding");
				padding.PaddingLeft = new UDim(0, 4);
				padding.PaddingRight = new UDim(0, 4);
				padding.PaddingTop = new UDim(0, 2);
				padding.PaddingBottom = new UDim(0, 2);
				padding.Parent = bg;

				// Label text
				const textLabel = new Instance("TextLabel");
				textLabel.Name = "Label";
				textLabel.Text = props.buildingLabel;
				textLabel.Size = new UDim2(1, 0, 1, 0);
				textLabel.BackgroundTransparency = 1;
				textLabel.TextColor3 = getLabelColor(props.buildingLabel);
				textLabel.TextSize = 12;
				textLabel.Font = Enum.Font.GothamBold;
				textLabel.TextScaled = false;
				textLabel.Parent = bg;

				billboard.Parent = part;
				this.labels.set(tileIdx, billboard);
			}
		} else if (existingLabel) {
			// Remove label if tile no longer needs one
			existingLabel.Destroy();
			this.labels.delete(tileIdx);
		}
	}

	/** Clean up all parts. */
	public destroy(): void {
		this.rootFolder.Destroy();
		this.parts.clear();
		this.labels.clear();
	}
}

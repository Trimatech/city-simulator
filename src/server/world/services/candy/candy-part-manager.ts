import { CollectionService, Workspace } from "@rbxts/services";
import {
	CANDY_ATTR_EATEN,
	CANDY_ATTR_ID,
	CANDY_ATTR_SIZE,
	CANDY_ATTR_TARGET_Y,
	CANDY_ATTR_TIME_ADDED,
	CANDY_GROUND_Y,
	CANDY_TAG,
	CANDY_TARGET_Y,
} from "shared/constants/core";
import type { CandyEntity } from "shared/store/candy-grid/candy-types";

// Folder to hold all candy parts
let candiesFolder: Folder | undefined;

function ensureCandiesFolder(): Folder {
	if (!candiesFolder) {
		candiesFolder = new Instance("Folder");
		candiesFolder.Name = "ServerCandies";
		candiesFolder.Parent = Workspace;
	}
	return candiesFolder;
}

// Map from candy ID to Part
const candyParts = new Map<string, BasePart>();

/**
 * Creates a candy part at ground level with CollectionService tag.
 * Client will animate it up to target height.
 */
export function createCandyPart(candy: CandyEntity): BasePart {
	const part = new Instance("Part");
	part.Name = `candy_${candy.id}`;
	part.Shape = Enum.PartType.Ball;
	part.Size = new Vector3(candy.size, candy.size, candy.size);
	part.Position = new Vector3(candy.position.X, CANDY_GROUND_Y, candy.position.Y);
	part.Color = candy.color;
	part.Transparency = 0.25;
	part.Material = Enum.Material.Neon;
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Anchored = true;
	part.CanCollide = false;
	part.CastShadow = false;

	// Set attributes for client-side animation
	part.SetAttribute(CANDY_ATTR_ID, candy.id);
	part.SetAttribute(CANDY_ATTR_TIME_ADDED, Workspace.GetServerTimeNow());
	part.SetAttribute(CANDY_ATTR_SIZE, candy.size);
	part.SetAttribute(CANDY_ATTR_TARGET_Y, CANDY_TARGET_Y);
	part.SetAttribute(CANDY_ATTR_EATEN, false);

	// Add tag for CollectionService
	CollectionService.AddTag(part, CANDY_TAG);

	part.Parent = ensureCandiesFolder();

	candyParts.set(candy.id, part);

	return part;
}

/**
 * Marks a candy as eaten. Client will animate it upward and fade out.
 */
export function markCandyEaten(candyId: string): void {
	const part = candyParts.get(candyId);
	if (part) {
		part.SetAttribute(CANDY_ATTR_EATEN, true);
	}
}

/**
 * Removes a candy part from the world.
 */
export function removeCandyPart(candyId: string): void {
	const part = candyParts.get(candyId);
	if (part) {
		part.Destroy();
		candyParts.delete(candyId);
	}
}

/**
 * Creates multiple candy parts at once.
 */
export function createCandyParts(candies: CandyEntity[]): void {
	for (const candy of candies) {
		createCandyPart(candy);
	}
}

/**
 * Clears all candy parts.
 */
export function clearAllCandyParts(): void {
	for (const [id] of candyParts) {
		removeCandyPart(id);
	}
}

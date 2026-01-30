import { CollectionService, Workspace } from "@rbxts/services";
import { store } from "server/store";
import {
	TRACER_PIECE_HEIGHT,
	WALL_ATTR_EDGE_ID,
	WALL_ATTR_KIND,
	WALL_ATTR_OWNER_ID,
	WALL_ATTR_SKIN_ID,
	WALL_ATTR_TARGET_Y,
	WALL_ATTR_TIME_ADDED,
	WALL_HEIGHT,
	WALL_TAG,
	WALL_THICKNESS,
	WALL_UNDERGROUND_OFFSET,
} from "shared/constants/core";
import type { GridCellsByEdgeId, GridLine } from "shared/store/grid/grid-types";
import { selectSoldiersById } from "shared/store/soldiers";

// Folder to hold all wall parts
let wallsFolder: Folder | undefined;

function ensureWallsFolder(): Folder {
	if (!wallsFolder) {
		wallsFolder = new Instance("Folder");
		wallsFolder.Name = "ServerWalls";
		wallsFolder.Parent = Workspace;
	}
	return wallsFolder;
}

// Map from composite key (cellKey:edgeId) to Part
const wallParts = new Map<string, BasePart>();

function getCompositeKey(cellKey: string, edgeId: string): string {
	return `${cellKey}:${edgeId}`;
}

function getHeightForKind(kind: "tracer" | "area" | "area2"): number {
	if (kind === "tracer") return TRACER_PIECE_HEIGHT;
	if (kind === "area2") return WALL_HEIGHT + 1;
	return WALL_HEIGHT;
}

function calculateWallTransform(
	a: Vector2,
	b: Vector2,
	height: number,
	underground: boolean,
): { width: number; center: Vector3; rotation: CFrame } {
	const startPoint = new Vector3(a.X, 0, a.Y);
	const endPoint = new Vector3(b.X, 0, b.Y);

	const direction = endPoint.sub(startPoint);
	const width = direction.Magnitude;

	const targetY = height / 2 - 1; // Y_OFFSET from Walls.utils.ts is -1
	const actualY = underground ? WALL_UNDERGROUND_OFFSET : targetY;

	const groundCenter = startPoint.add(direction.mul(0.5));
	const center = new Vector3(groundCenter.X, actualY, groundCenter.Z);

	const rotation = CFrame.lookAt(new Vector3(), new Vector3(direction.X, 0, direction.Z)).mul(
		CFrame.fromEulerAnglesXYZ(0, math.rad(90), 0),
	);

	return { width, center, rotation };
}

function getSoldierSkin(ownerId: string): string {
	const soldiers = selectSoldiersById(store.getState());
	return soldiers[ownerId]?.skin ?? "";
}

function createWallPart(cellKey: string, edgeId: string, line: GridLine): BasePart {
	const height = getHeightForKind(line.kind);
	const { width, center, rotation } = calculateWallTransform(line.a, line.b, height, true);
	const targetY = height / 2 - 1;

	const part = new Instance("Part");
	part.Name = `wall_${cellKey}_${edgeId}`;
	part.Size = new Vector3(width, height, WALL_THICKNESS);
	part.CFrame = new CFrame(center).mul(rotation);
	part.Anchored = true;
	part.CanCollide = false;
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Material = Enum.Material.SmoothPlastic;
	part.Color = new Color3(1, 1, 1); // Default white, client will apply skin

	// Get soldier's skin
	const skinId = getSoldierSkin(line.ownerId);

	// Set attributes for client-side animation
	part.SetAttribute(WALL_ATTR_TIME_ADDED, Workspace.GetServerTimeNow());
	part.SetAttribute(WALL_ATTR_KIND, line.kind);
	part.SetAttribute(WALL_ATTR_OWNER_ID, line.ownerId);
	part.SetAttribute(WALL_ATTR_EDGE_ID, edgeId);
	part.SetAttribute(WALL_ATTR_TARGET_Y, targetY);
	part.SetAttribute(WALL_ATTR_SKIN_ID, skinId);

	// Add tag for CollectionService
	CollectionService.AddTag(part, WALL_TAG);

	part.Parent = ensureWallsFolder();

	return part;
}

function updateWallPart(part: BasePart, line: GridLine): void {
	const height = getHeightForKind(line.kind);
	const { width, center, rotation } = calculateWallTransform(line.a, line.b, height, true);
	const targetY = height / 2 - 1;

	// Update size and position (keep underground since client handles animation)
	part.Size = new Vector3(width, height, WALL_THICKNESS);
	part.CFrame = new CFrame(center).mul(rotation);

	// Update attributes
	part.SetAttribute(WALL_ATTR_KIND, line.kind);
	part.SetAttribute(WALL_ATTR_OWNER_ID, line.ownerId);
	part.SetAttribute(WALL_ATTR_TARGET_Y, targetY);
}

function destroyWallPart(compositeKey: string): void {
	const part = wallParts.get(compositeKey);
	if (part) {
		part.Destroy();
		wallParts.delete(compositeKey);
	}
}

/**
 * Syncs wall parts for a given cell based on the new cell content.
 * Creates, updates, or destroys parts as needed.
 */
export function syncCellWallParts(cellKey: string, newContent: GridCellsByEdgeId | undefined): void {
	// Get all existing parts for this cell
	const existingKeys = new Set<string>();
	for (const [key] of wallParts) {
		if (key.sub(1, cellKey.size() + 1) === `${cellKey}:`) {
			existingKeys.add(key);
		}
	}

	// Process new content
	if (newContent) {
		for (const [edgeId, line] of pairs(newContent)) {
			if (!line) continue;

			const compositeKey = getCompositeKey(cellKey, edgeId as string);
			existingKeys.delete(compositeKey);

			const existingPart = wallParts.get(compositeKey);
			if (existingPart) {
				// Update existing part
				updateWallPart(existingPart, line);
			} else {
				// Create new part
				const part = createWallPart(cellKey, edgeId as string, line);
				wallParts.set(compositeKey, part);
			}
		}
	}

	// Destroy parts that are no longer in the cell
	for (const key of existingKeys) {
		destroyWallPart(key);
	}
}

/**
 * Clears all wall parts for a given owner.
 */
export function clearOwnerWallParts(ownerId: string): void {
	const toRemove: string[] = [];

	for (const [key, part] of wallParts) {
		if (part.GetAttribute(WALL_ATTR_OWNER_ID) === ownerId) {
			toRemove.push(key);
		}
	}

	for (const key of toRemove) {
		destroyWallPart(key);
	}
}

/**
 * Clears all wall parts.
 */
export function clearAllWallParts(): void {
	for (const [key] of wallParts) {
		destroyWallPart(key);
	}
}

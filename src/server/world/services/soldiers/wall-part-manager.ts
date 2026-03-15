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

/**
 * Compute how much to extend one end of a wall segment so its outer corner
 * touches the outer corner of the adjacent wall (resizeToTouch / miter join).
 * Only extends for outside corners (miterFactor > 0).
 *
 * segDir:      unit direction of this segment FROM the endpoint being extended
 * neighborDir: unit direction FROM that endpoint TOWARD its neighbor point
 */
function computeOutsideCornerExtension(
	segDir: Vector2,
	neighborDir: Vector2,
	miterFactor: number | undefined,
): number {
	if (!miterFactor || miterFactor <= 0) return 0;
	const dot = math.clamp(segDir.Dot(neighborDir), -1, 1);
	const theta = math.acos(dot);
	// Straight line or U-turn — no extension needed
	if (theta <= 1e-3 || math.abs(theta - math.pi) <= 1e-3) return 0;
	const t = math.tan(theta / 2);
	if (math.abs(t) < 1e-6) return 0;
	return (WALL_THICKNESS / 2) / t;
}

function calculateWallTransform(
	a: Vector2,
	b: Vector2,
	height: number,
	underground: boolean,
	line?: { startNeighborDir?: Vector2; endNeighborDir?: Vector2; startMiterFactor?: number; endMiterFactor?: number },
): { width: number; center: Vector3; rotation: CFrame } {
	const startPoint = new Vector3(a.X, 0, a.Y);
	const endPoint = new Vector3(b.X, 0, b.Y);

	const direction = endPoint.sub(startPoint);
	const baseWidth = direction.Magnitude;

	// Extend each outside corner so parts touch at the outer edge (resizeToTouch)
	let extA = 0;
	let extB = 0;
	if (line && baseWidth > 1e-6) {
		const dir2D = new Vector2(direction.X, direction.Z).div(baseWidth);
		if (line.startNeighborDir) {
			// segDir at A points from A toward B; neighborDir points from A toward prev
			extA = computeOutsideCornerExtension(dir2D, line.startNeighborDir, line.startMiterFactor);
		}
		if (line.endNeighborDir) {
			// segDir at B points from B back toward A; neighborDir points from B toward next
			extB = computeOutsideCornerExtension(dir2D.mul(-1), line.endNeighborDir, line.endMiterFactor);
		}
	}

	const width = baseWidth + extA + extB;

	const targetY = height / 2 - 1; // Y_OFFSET from Walls.utils.ts is -1
	const actualY = underground ? WALL_UNDERGROUND_OFFSET : targetY;

	const groundCenter = startPoint.add(direction.mul(0.5));
	// Shift center along the wall direction to account for asymmetric extensions
	const shift = baseWidth > 1e-6 ? (extB - extA) / 2 : 0;
	const dirUnit = baseWidth > 1e-6 ? direction.div(baseWidth) : new Vector3(1, 0, 0);
	const center = new Vector3(
		groundCenter.X + dirUnit.X * shift,
		actualY,
		groundCenter.Z + dirUnit.Z * shift,
	);

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
	const { width, center, rotation } = calculateWallTransform(line.a, line.b, height, true, line);
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

	part.Parent = ensureWallsFolder();

	// Add tag for CollectionService
	CollectionService.AddTag(part, WALL_TAG);

	return part;
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
 * Creates or destroys parts as needed. Never updates - existing walls keep their position
 * (client handles animation and we don't want to reset them to underground).
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

			// Only create if doesn't exist - never update existing walls
			// (updating would reset CFrame to underground, breaking client animation)
			if (!wallParts.has(compositeKey)) {
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

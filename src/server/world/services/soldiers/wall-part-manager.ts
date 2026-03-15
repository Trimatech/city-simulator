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
import { selectGridResolution } from "shared/store/grid/grid-selectors";
import type { GridCellsByEdgeId, GridLine } from "shared/store/grid/grid-types";
import { selectSoldiersById, selectSoldierZIndex } from "shared/store/soldiers";
import { quantizeVector2 } from "shared/utils/edge-id";
import { getQuantizationStep } from "shared/utils/grid-lines.utils";

// ---------------------------------------------------------------------------
// Folder to hold all wall parts
// ---------------------------------------------------------------------------
let wallsFolder: Folder | undefined;

function ensureWallsFolder(): Folder {
	if (!wallsFolder) {
		wallsFolder = new Instance("Folder");
		wallsFolder.Name = "ServerWalls";
		wallsFolder.Parent = Workspace;
	}
	return wallsFolder;
}

// ---------------------------------------------------------------------------
// Wall part registry: composite key (cellKey:edgeId) → Part
// ---------------------------------------------------------------------------
const wallParts = new Map<string, BasePart>();

function getCompositeKey(cellKey: string, edgeId: string): string {
	return `${cellKey}:${edgeId}`;
}

// ---------------------------------------------------------------------------
// Line registry: composite key → { cellKey, edgeId, line }
// Needed so we can look up the GridLine data for an existing wall part.
// ---------------------------------------------------------------------------
interface LineEntry {
	cellKey: string;
	edgeId: string;
	line: GridLine;
}
const lineRegistry = new Map<string, LineEntry>();

// ---------------------------------------------------------------------------
// Vertex index: quantized vertex key → entries sharing that vertex
// Enables O(1) lookup of adjacent lines at a shared endpoint.
// ---------------------------------------------------------------------------
interface VertexEntry {
	compositeKey: string;
	endpoint: "a" | "b";
}
const vertexIndex = new Map<string, VertexEntry[]>();

function getVertexKey(pos: Vector2, ownerId: string): string {
	const resolution = selectGridResolution({ grid: store.getState().grid });
	const q = getQuantizationStep(resolution);
	const qp = quantizeVector2(pos, q);
	return `${qp.X}_${qp.Y}:${ownerId}`;
}

function registerLine(compositeKey: string, entry: LineEntry): void {
	lineRegistry.set(compositeKey, entry);
	const { line } = entry;
	for (const ep of ["a", "b"] as const) {
		const pos = ep === "a" ? line.a : line.b;
		const vk = getVertexKey(pos, line.ownerId);
		let list = vertexIndex.get(vk);
		if (!list) {
			list = [];
			vertexIndex.set(vk, list);
		}
		list.push({ compositeKey, endpoint: ep });
	}
}

function unregisterLine(compositeKey: string): void {
	const entry = lineRegistry.get(compositeKey);
	if (!entry) return;
	const { line } = entry;
	for (const ep of ["a", "b"] as const) {
		const pos = ep === "a" ? line.a : line.b;
		const vk = getVertexKey(pos, line.ownerId);
		const list = vertexIndex.get(vk);
		if (list) {
			const idx = list.findIndex((e) => e.compositeKey === compositeKey && e.endpoint === ep);
			if (idx !== -1) list.remove(idx);
			if (list.size() === 0) vertexIndex.delete(vk);
		}
	}
	lineRegistry.delete(compositeKey);
}

// ---------------------------------------------------------------------------
// Dynamic miter extension computation
// ---------------------------------------------------------------------------
const MAX_MITER_EXTENSION = WALL_THICKNESS * 3;

function computeMiterExtensionAtEndpoint(compositeKey: string, line: GridLine, endpoint: "a" | "b"): number {
	const pos = endpoint === "a" ? line.a : line.b;
	const vk = getVertexKey(pos, line.ownerId);
	const neighbors = vertexIndex.get(vk);
	if (!neighbors || neighbors.size() < 2) return 0;

	// Direction of this segment away from the shared vertex
	const thisDir = endpoint === "a" ? line.b.sub(line.a) : line.a.sub(line.b);
	if (thisDir.Magnitude < 1e-6) return 0;
	const thisDirUnit = thisDir.Unit;

	// Find the best neighbor (smallest extension = most natural join)
	let bestExt = math.huge;
	for (const neighbor of neighbors) {
		if (neighbor.compositeKey === compositeKey) continue;
		const nEntry = lineRegistry.get(neighbor.compositeKey);
		if (!nEntry) continue;

		// Direction of neighbor segment away from the shared vertex
		const otherDir =
			neighbor.endpoint === "a" ? nEntry.line.b.sub(nEntry.line.a) : nEntry.line.a.sub(nEntry.line.b);
		if (otherDir.Magnitude < 1e-6) continue;
		const otherDirUnit = otherDir.Unit;

		const dot = math.clamp(thisDirUnit.Dot(otherDirUnit), -1, 1);
		const theta = math.acos(dot);
		// Colinear or U-turn — no extension needed
		if (theta <= 1e-3 || math.abs(theta - math.pi) <= 1e-3) continue;
		const t = math.tan(theta / 2);
		if (math.abs(t) < 1e-6) continue;
		const ext = math.min(WALL_THICKNESS / 2 / t, MAX_MITER_EXTENSION);
		if (ext < bestExt) bestExt = ext;
	}

	return bestExt < math.huge ? bestExt : 0;
}

// ---------------------------------------------------------------------------
// Wall geometry
// ---------------------------------------------------------------------------
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
	extA: number,
	extB: number,
	yOffsetExtra = 0,
): { width: number; center: Vector3; rotation: CFrame } {
	const startPoint = new Vector3(a.X, 0, a.Y);
	const endPoint = new Vector3(b.X, 0, b.Y);

	const direction = endPoint.sub(startPoint);
	const baseWidth = direction.Magnitude;
	const width = baseWidth + extA + extB;

	const targetY = height / 2 - 1 + yOffsetExtra;
	const actualY = underground ? WALL_UNDERGROUND_OFFSET : targetY;

	const groundCenter = startPoint.add(direction.mul(0.5));
	const shift = baseWidth > 1e-6 ? (extB - extA) / 2 : 0;
	const dirUnit = baseWidth > 1e-6 ? direction.div(baseWidth) : new Vector3(1, 0, 0);
	const center = new Vector3(groundCenter.X + dirUnit.X * shift, actualY, groundCenter.Z + dirUnit.Z * shift);

	const rotation = CFrame.lookAt(new Vector3(), new Vector3(direction.X, 0, direction.Z)).mul(
		CFrame.fromEulerAnglesXYZ(0, math.rad(90), 0),
	);

	return { width, center, rotation };
}

// ---------------------------------------------------------------------------
// Update an existing wall part's size/position (without recreating it)
// ---------------------------------------------------------------------------
function updateWallPartGeometry(compositeKey: string): void {
	const part = wallParts.get(compositeKey);
	const entry = lineRegistry.get(compositeKey);
	if (!part || !entry) return;

	const { line } = entry;
	const height = getHeightForKind(line.kind);
	const extA = computeMiterExtensionAtEndpoint(compositeKey, line, "a");
	const extB = computeMiterExtensionAtEndpoint(compositeKey, line, "b");
	const yOffset = getSoldierYOffset(line.ownerId);
	const { width, center, rotation } = calculateWallTransform(line.a, line.b, height, false, extA, extB, yOffset);

	part.Size = new Vector3(width, height, WALL_THICKNESS);
	part.CFrame = new CFrame(center).mul(rotation);
}

// ---------------------------------------------------------------------------
// Update all neighbors at both endpoints of a line
// ---------------------------------------------------------------------------
function updateAdjacentWallParts(compositeKey: string, line: GridLine): void {
	for (const ep of ["a", "b"] as const) {
		const pos = ep === "a" ? line.a : line.b;
		const vk = getVertexKey(pos, line.ownerId);
		const neighbors = vertexIndex.get(vk);
		if (!neighbors) continue;
		for (const neighbor of neighbors) {
			if (neighbor.compositeKey === compositeKey) continue;
			if (wallParts.has(neighbor.compositeKey)) {
				updateWallPartGeometry(neighbor.compositeKey);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Create / destroy wall parts
// ---------------------------------------------------------------------------
function getSoldierSkin(ownerId: string): string {
	const soldiers = selectSoldiersById(store.getState());
	return soldiers[ownerId]?.skin ?? "";
}

function getSoldierYOffset(ownerId: string): number {
	return store.getState(selectSoldierZIndex(ownerId)) * 0.0001;
}

function createWallPart(cellKey: string, edgeId: string, line: GridLine): BasePart {
	const compositeKey = getCompositeKey(cellKey, edgeId);

	// Register in vertex index FIRST so miter can be computed
	registerLine(compositeKey, { cellKey, edgeId, line });

	const height = getHeightForKind(line.kind);
	const extA = computeMiterExtensionAtEndpoint(compositeKey, line, "a");
	const extB = computeMiterExtensionAtEndpoint(compositeKey, line, "b");
	const yOffset = getSoldierYOffset(line.ownerId);
	const { width, center, rotation } = calculateWallTransform(line.a, line.b, height, true, extA, extB, yOffset);
	const targetY = height / 2 - 1 + yOffset;

	const part = new Instance("Part");
	part.Name = `wall_${cellKey}_${edgeId}`;
	part.Size = new Vector3(width, height, WALL_THICKNESS);
	part.CFrame = new CFrame(center).mul(rotation);
	part.Anchored = true;
	part.CanCollide = false;
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.BottomSurface = Enum.SurfaceType.Smooth;
	part.Material = Enum.Material.SmoothPlastic;
	part.Color = new Color3(1, 1, 1);

	const skinId = getSoldierSkin(line.ownerId);

	part.SetAttribute(WALL_ATTR_TIME_ADDED, Workspace.GetServerTimeNow());
	part.SetAttribute(WALL_ATTR_KIND, line.kind);
	part.SetAttribute(WALL_ATTR_OWNER_ID, line.ownerId);
	part.SetAttribute(WALL_ATTR_EDGE_ID, edgeId);
	part.SetAttribute(WALL_ATTR_TARGET_Y, targetY);
	part.SetAttribute(WALL_ATTR_SKIN_ID, skinId);

	part.Parent = ensureWallsFolder();
	CollectionService.AddTag(part, WALL_TAG);

	return part;
}

function destroyWallPart(compositeKey: string): void {
	// Unregister from vertex index BEFORE destroying so neighbors can be updated
	const entry = lineRegistry.get(compositeKey);
	unregisterLine(compositeKey);

	const part = wallParts.get(compositeKey);
	if (part) {
		part.Destroy();
		wallParts.delete(compositeKey);
	}

	// Update neighbors that lost their connection (their extension should shrink)
	if (entry) {
		updateAdjacentWallParts(compositeKey, entry.line);
	}
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Syncs wall parts for a given cell based on the new cell content.
 * Creates, destroys, or updates parts as needed. When a new part is created
 * at a shared vertex, adjacent parts are resized for a seamless miter join.
 */
export function syncCellWallParts(cellKey: string, newContent: GridCellsByEdgeId | undefined): void {
	// Get all existing parts for this cell
	const existingKeys = new Set<string>();
	for (const [key] of wallParts) {
		if (key.sub(1, cellKey.size() + 1) === `${cellKey}:`) {
			existingKeys.add(key);
		}
	}

	// Track newly created composite keys so we can update their neighbors after
	const newlyCreated: string[] = [];

	// Process new content
	if (newContent) {
		for (const [edgeId, line] of pairs(newContent)) {
			if (!line) continue;

			const compositeKey = getCompositeKey(cellKey, edgeId as string);
			existingKeys.delete(compositeKey);

			if (!wallParts.has(compositeKey)) {
				const part = createWallPart(cellKey, edgeId as string, line);
				wallParts.set(compositeKey, part);
				newlyCreated.push(compositeKey);
			}
		}
	}

	// Destroy parts that are no longer in the cell
	for (const key of existingKeys) {
		destroyWallPart(key);
	}

	// Update adjacent wall parts for all newly created lines
	for (const ck of newlyCreated) {
		const entry = lineRegistry.get(ck);
		if (entry) {
			updateAdjacentWallParts(ck, entry.line);
		}
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

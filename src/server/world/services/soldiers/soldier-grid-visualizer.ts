import { Workspace } from "@rbxts/services";
import type { GridPoint } from "shared/utils/grid";

// Tracer visualization now derives directly from soldierGrid metadata
import { soldierGrid } from "./soldier-grid";

const CONTAINER_NAME = "SoldierGridDebug";

const keyToPart = new Map<string, Part>();
const keyToPointsFolder = new Map<string, Folder>();
const keyToColor = new Map<string, Color3>();

function ensureContainer() {
	let folder = Workspace.FindFirstChild(CONTAINER_NAME) as Folder | undefined;
	if (!folder) {
		folder = new Instance("Folder");
		folder.Name = CONTAINER_NAME;
		folder.Parent = Workspace;
	}
	return folder;
}

function cellKeyToString(key: Vector3) {
	return `${key.X},${key.Y}`;
}

// _stringToKey kept for potential debugging helpers
function _stringToKey(str: string) {
	const parts = str.split(",");
	return new Vector3(tonumber(parts[0]) ?? 0, tonumber(parts[1]) ?? 0, 0);
}

function getOrAssignCellColor(mapKey: string) {
	let color = keyToColor.get(mapKey);
	if (!color) {
		color = new Color3(math.random(), math.random(), math.random());
		keyToColor.set(mapKey, color);
	}
	return color;
}

function createOrUpdatePartForCell(folder: Folder, key: Vector3) {
	const res = soldierGrid.resolution;
	const center = new Vector3((key.X + 0.5) * res, 0.25, (key.Y + 0.5) * res);
	const size = new Vector3(res, 0.5, res);

	const mapKey = cellKeyToString(key);
	let part = keyToPart.get(mapKey);
	if (!part) {
		part = new Instance("Part");
		part.Name = `cell_${mapKey}`;
		part.Anchored = true;
		part.CanCollide = false;
		part.CanQuery = false;
		part.CanTouch = false;
		part.Material = Enum.Material.SmoothPlastic;
		part.Transparency = 0.8;
		part.Color = new Color3(0.8, 0.8, 0.8);
		part.Parent = folder;
		keyToPart.set(mapKey, part);
	}

	part.Size = size;
	part.CFrame = new CFrame(center);

	return part;
}

function destroyPart(mapKey: string) {
	const part = keyToPart.get(mapKey);
	if (part) {
		keyToPart.delete(mapKey);
		part.Destroy();
	}
	const pointsFolder = keyToPointsFolder.get(mapKey);
	if (pointsFolder) {
		keyToPointsFolder.delete(mapKey);
	}
	if (keyToColor.has(mapKey)) keyToColor.delete(mapKey);
}

// Note: segment-to-cell assignment not used in point mode

function ensurePointsFolder(parent: Instance, mapKey: string) {
	let folder = keyToPointsFolder.get(mapKey);
	if (!folder) {
		folder = new Instance("Folder");
		folder.Name = `points_${mapKey}`;
		folder.Parent = parent;
		keyToPointsFolder.set(mapKey, folder);
	}
	return folder;
}

function upsertSpherePart(folder: Folder, name: string, position: Vector2, color: Color3) {
	let part = folder.FindFirstChild(name) as Part | undefined;
	if (!part) {
		part = new Instance("Part");
		part.Name = name;
		part.Anchored = true;
		part.CanCollide = false;
		part.CanQuery = false;
		part.CanTouch = false;
		part.Shape = Enum.PartType.Ball;
		part.Material = Enum.Material.Neon;
		part.Parent = folder;
	}
	part.Color = color;
	part.Transparency = 0.1;
	const res = soldierGrid.resolution;
	const diameter = math.max(0.2, math.min(res * 0.35, 2));
	part.Size = new Vector3(diameter, diameter, diameter);
	part.CFrame = new CFrame(new Vector3(position.X, 0.55, position.Y));
}

function updateCellPoints(mapKey: string, cellPart: Part, cellKey: Vector3) {
	const color = getOrAssignCellColor(mapKey);
	const folder = ensurePointsFolder(cellPart, mapKey);
	const expected = new Set<string>();

	const cell = soldierGrid.cells.get(cellKey);
	if (cell) {
		for (const [p3, point] of cell) {
			const name = `pt_${(p3 as Vector3).X}_${(p3 as Vector3).Y}`;
			expected.add(name);
			upsertSpherePart(folder, name, (point as GridPoint<{ id: string }>).position, color);
		}
	}

	for (const child of folder.GetChildren()) {
		if (!expected.has(child.Name)) child.Destroy();
	}
}

export function updateSoldierGridVisualization() {
	const folder = ensureContainer();

	const nextKeys = new Set<string>();
	for (const [key] of soldierGrid.cells) {
		const mapKey = cellKeyToString(key as Vector3);
		nextKeys.add(mapKey);
		const part = createOrUpdatePartForCell(folder, key as Vector3);
		updateCellPoints(mapKey, part, key as Vector3);
	}

	for (const [existingKey] of keyToPart) {
		if (!nextKeys.has(existingKey as string)) {
			destroyPart(existingKey as string);
		}
	}
}

export function clearSoldierGridVisualization() {
	for (const [existingKey] of keyToPart) {
		destroyPart(existingKey as string);
	}
	const container = Workspace.FindFirstChild(CONTAINER_NAME);
	if (container) container.Destroy();
}

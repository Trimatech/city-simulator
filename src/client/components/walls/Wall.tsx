import { memo, useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getSoldierSkin, getSoldierSkinForTracer } from "shared/constants/skins";

import {
	calculateWallTransform,
	createCylinder,
	createWallHighlight,
	createWallPart,
	uncollideAndDestroy,
} from "./Walls.utils";

const WALL_MATERIAL = Enum.Material.SmoothPlastic;

interface Appearance {
	color: Color3;
	material: Enum.Material;
	transparency: number;
}

function resolveAppearance({
	skinId,
	tracerIndex,
	fallbackColor,
	transparency,
}: {
	skinId?: string;
	tracerIndex?: number;
	fallbackColor: Color3;
	transparency: number;
}): Appearance {
	if (skinId !== undefined) {
		if (tracerIndex !== undefined) {
			const tracerSkin = getSoldierSkinForTracer(skinId, tracerIndex);
			return { color: tracerSkin.tint, material: WALL_MATERIAL, transparency };
		}
		const skin = getSoldierSkin(skinId);
		return { color: skin.tint[0], material: WALL_MATERIAL, transparency };
	}
	return { color: fallbackColor, material: WALL_MATERIAL, transparency };
}

function ensureFolder(name: string): Folder {
	let folder = Workspace.FindFirstChild(name) as Folder;
	if (!folder) {
		folder = new Instance("Folder");
		folder.Name = name;
		folder.Parent = Workspace;
	}
	return folder;
}

interface Props {
	folderName: string;
	startPoint: Vector2;
	endPoint: Vector2;
	color?: Color3;
	transparency?: number;
	height: number;
	thickness?: number;
	isCrumbling?: boolean;
	skinId?: string;
	tracerIndex?: number;
	outline?: boolean;
	crumbleDelaySeconds?: number;
}

function WallComponent({
	folderName,
	startPoint,
	endPoint,
	color = palette.white,
	transparency = 0,
	height,
	thickness = 1,
	isCrumbling = false,
	skinId,
	tracerIndex,
	outline = false,
}: Props) {
	const mainPartRef = useRef<Part>();
	const cylinderRef = useRef<Part>();
	const outlineRef = useRef<Highlight>();

	//print(`rendering wall ${folderName} ${startPoint.X},${startPoint.Y} -> ${endPoint.X},${endPoint.Y}`);

	//	print("rendering properties", wallProperties);

	// Create wall parts once
	useEffect(() => {
		if (isCrumbling) return;

		const folder = ensureFolder(folderName);

		const { width, center, rotation, startPosition } = calculateWallTransform([startPoint, endPoint], height);

		const wallProperties = resolveAppearance({
			skinId,
			tracerIndex,
			fallbackColor: color,
			transparency,
		});

		const part = createWallPart({
			folderName,
			width,
			height,
			thickness,
			center,
			rotation,
			color: wallProperties.color,
			transparency: wallProperties.transparency,
			material: wallProperties.material,
		});
		part.Parent = folder;

		const cylinder = createCylinder({
			folderName,
			height,
			thickness,
			startPosition,
			color: wallProperties.color,
			transparency: wallProperties.transparency,
			material: wallProperties.material,
		});
		cylinder.Parent = folder;

		if (outline) {
			outlineRef.current = createWallHighlight(part);
		}

		mainPartRef.current = part;
		cylinderRef.current = cylinder;

		return () => {
			if (outlineRef.current) outlineRef.current.Destroy();
			if (mainPartRef.current) uncollideAndDestroy(mainPartRef.current, math.random(0.5, 2));
			if (cylinderRef.current) uncollideAndDestroy(cylinderRef.current, math.random(0.5, 2));
		};
		// create once; subsequent updates handled by effects below
	}, []);

	// Update transform (position/size/orientation) on geometry changes
	useEffect(() => {
		const part = mainPartRef.current;
		const cylinder = cylinderRef.current;
		if (!part || !cylinder) return;

		const { width, center, rotation, startPosition } = calculateWallTransform([startPoint, endPoint], height);

		part.Size = new Vector3(width, height, thickness);
		part.CFrame = new CFrame(center).mul(rotation);

		cylinder.Size = new Vector3(height, thickness, thickness);
		cylinder.CFrame = new CFrame(startPosition).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)));
	}, [startPoint.X, startPoint.Y, endPoint.X, endPoint.Y, height, thickness]);

	// Update visuals (color/material/transparency) when appearance props change
	useEffect(() => {
		const part = mainPartRef.current;
		const cylinder = cylinderRef.current;
		if (!part || !cylinder) return;

		const wallProperties = resolveAppearance({
			skinId,
			tracerIndex,
			fallbackColor: color,
			transparency,
		});

		part.Color = wallProperties.color;
		part.Transparency = wallProperties.transparency;
		part.Material = wallProperties.material;

		cylinder.Color = wallProperties.color;
		cylinder.Transparency = wallProperties.transparency;
		cylinder.Material = wallProperties.material;
	}, [color, transparency, skinId, tracerIndex]);

	// Toggle outline without recreating
	useEffect(() => {
		const part = mainPartRef.current;
		if (!part) return;
		if (outline) {
			if (!outlineRef.current || outlineRef.current.Parent !== part) {
				outlineRef.current = createWallHighlight(part);
			}
			return;
		}
		if (outlineRef.current) {
			outlineRef.current.Destroy();
			outlineRef.current = undefined;
		}
	}, [outline]);

	// Handle crumbling: destroy existing parts once when enabled
	useEffect(() => {
		if (!isCrumbling) return;
		if (outlineRef.current) {
			outlineRef.current.Destroy();
			outlineRef.current = undefined;
		}
		if (mainPartRef.current) {
			uncollideAndDestroy(mainPartRef.current, math.random(0.5, 2));
			mainPartRef.current = undefined;
		}
		if (cylinderRef.current) {
			uncollideAndDestroy(cylinderRef.current, math.random(0.5, 2));
			cylinderRef.current = undefined;
		}
	}, [isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

import { memo, useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getSoldierSkin, getSoldierSkinForTracer } from "shared/constants/skins";

import {
	calculateWallTransform,
	createWallHighlight,
	createWallPieces,
	startCrumbling,
	startFadeOut,
} from "./Walls.utils";

interface Props {
	folderName: string;
	startPoint: Vector2;
	endPoint: Vector2;
	color?: Color3;
	transparency?: number;
	height?: number;
	thickness?: number;
	isCrumbling?: boolean;
	skinId?: string;
	tracerIndex?: number;
	outline?: boolean;
}

function WallComponent({
	folderName,
	startPoint,
	endPoint,
	color = palette.white,
	transparency = 0,
	height = 5,
	thickness = 1,
	isCrumbling = false,
	skinId,
	tracerIndex,
	outline = false,
}: Props) {
	const mainPartRef = useRef<Part>();
	const cylinderRef = useRef<Part>();
	const debrisRef = useRef<Part[]>([]);
	const cleanupRef = useRef<() => void>();

	// Get skin properties
	const wallProperties = (() => {
		if (skinId) {
			if (tracerIndex !== undefined) {
				const tracerSkin = getSoldierSkinForTracer(skinId, tracerIndex);
				return {
					color: tracerSkin.tint,
					material: Enum.Material.SmoothPlastic,
					transparency: transparency,
				};
			}
			const skin = getSoldierSkin(skinId);
			return {
				color: skin.tint[0],
				material: Enum.Material.SmoothPlastic,
				transparency: transparency,
			};
		}
		return { color, material: Enum.Material.SmoothPlastic, transparency };
	})();

	//	print("rendering properties", wallProperties);

	// Main wall creation effect
	useEffect(() => {
		if (isCrumbling) return;

		const { width, center, rotation, startPosition } = calculateWallTransform([startPoint, endPoint], height);

		// Ensure folder exists
		let folder = Workspace.FindFirstChild(folderName) as Folder;
		if (!folder) {
			folder = new Instance("Folder");
			folder.Name = folderName;
			folder.Parent = Workspace;
		}

		// Create main wall part
		const part = new Instance("Part");
		part.Name = `${folderName}_wall`;
		part.Size = new Vector3(width, height, thickness);
		part.Color = wallProperties.color;
		part.Transparency = wallProperties.transparency;
		part.Material = wallProperties.material;
		part.TopSurface = Enum.SurfaceType.Smooth;
		part.BottomSurface = Enum.SurfaceType.Smooth;
		part.Anchored = true;
		part.CanCollide = false;
		part.CFrame = new CFrame(center).mul(rotation);
		part.Parent = folder;

		// Optional outline via Highlight (client-side visual)
		if (outline) {
			createWallHighlight(part);
		}

		// Create cylinder for smooth start
		const cylinder = new Instance("Part");
		cylinder.Name = `${folderName}_cylinder`;
		cylinder.Size = new Vector3(height, thickness, thickness);
		cylinder.Color = wallProperties.color;
		cylinder.Transparency = wallProperties.transparency;
		cylinder.Material = wallProperties.material;
		cylinder.TopSurface = Enum.SurfaceType.Smooth;
		cylinder.BottomSurface = Enum.SurfaceType.Smooth;
		cylinder.Shape = Enum.PartType.Cylinder;
		cylinder.Anchored = true;
		cylinder.CanCollide = false;

		// Position cylinder at start of wall
		const cylinderCFrame = new CFrame(startPosition).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90))); // Rotate cylinder to stand upright
		cylinder.CFrame = cylinderCFrame;
		cylinder.Parent = folder;

		if (outline && part) createWallHighlight(part);

		mainPartRef.current = part;
		cylinderRef.current = cylinder;

		return () => {
			if (mainPartRef.current) {
				mainPartRef.current.Destroy();
				mainPartRef.current = undefined;
			}
			if (cylinderRef.current) {
				cylinderRef.current.Destroy();
				cylinderRef.current = undefined;
			}
		};
	}, [
		startPoint.X,
		startPoint.Y,
		endPoint.X,
		endPoint.Y,
		wallProperties.color,
		wallProperties.transparency,
		wallProperties.material,
		height,
		thickness,
		isCrumbling,
	]);

	// Crumbling effect
	useEffect(() => {
		if (!isCrumbling) return;

		// Clean up main wall and cylinder if they exist
		if (mainPartRef.current) {
			mainPartRef.current.Destroy();
			mainPartRef.current = undefined;
		}
		if (cylinderRef.current) {
			cylinderRef.current.Destroy();
			cylinderRef.current = undefined;
		}

		const { width, center, rotation } = calculateWallTransform([startPoint, endPoint], height);

		// Create debris pieces
		const pieces = createWallPieces({
			position: center,
			size: new Vector3(width, height, thickness),
			rotation: rotation,
			color: wallProperties.color,
			transparency: wallProperties.transparency,
			material: wallProperties.material,
		});

		// Ensure folder exists
		let folder = Workspace.FindFirstChild(folderName) as Folder;
		if (!folder) {
			folder = new Instance("Folder");
			folder.Name = folderName;
			folder.Parent = Workspace;
		}

		// Add pieces to folder
		pieces.forEach((piece) => (piece.Parent = folder));

		// Start crumbling animation
		cleanupRef.current = startCrumbling(pieces);
		debrisRef.current = pieces;

		return () => {
			cleanupRef.current?.();
			debrisRef.current.forEach((piece) => startFadeOut(piece));
			debrisRef.current = [];
		};
	}, [isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

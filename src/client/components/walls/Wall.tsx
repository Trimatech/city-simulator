import { memo, useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getSoldierSkin, getSoldierSkinForTracer } from "shared/constants/skins";

import {
	calculateWallTransform,
	createCylinder,
	createWallHighlight,
	createWallPart,
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
	height: number;
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
	height,
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
		// eslint-disable-next-line roblox-ts/lua-truthiness
		if (skinId) {
			// eslint-disable-next-line roblox-ts/lua-truthiness
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

		// Optional outline via Highlight (client-side visual)
		if (outline) {
			createWallHighlight(part);
		}

		// Create cylinder for smooth start
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

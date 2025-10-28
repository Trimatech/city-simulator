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

	//print(`rendering wall ${folderName} ${startPoint.X},${startPoint.Y} -> ${endPoint.X},${endPoint.Y}`);

	//	print("rendering properties", wallProperties);

	// Main wall creation effect
	useEffect(() => {
		//print(`creating wall ${folderName} ${startPoint.X},${startPoint.Y} -> ${endPoint.X},${endPoint.Y}`);
		if (isCrumbling) return;

		const { width, center, rotation, startPosition } = calculateWallTransform([startPoint, endPoint], height);

		// Ensure folder exists
		let folder = Workspace.FindFirstChild(folderName) as Folder;
		if (!folder) {
			folder = new Instance("Folder");
			folder.Name = folderName;
			folder.Parent = Workspace;
		}

		const wallProperties = (() => {
			//print(`wallProperties ${skinId} ${tracerIndex}`);
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
				//	print(`skin ${skinId} ${skin.tint[0]}`);
				return {
					color: skin.tint[0],
					material: Enum.Material.SmoothPlastic,
					transparency: transparency,
				};
			}
			//	print(`no skin ${color}`);
			return { color, material: Enum.Material.SmoothPlastic, transparency };
		})();

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
				uncollideAndDestroy(mainPartRef.current, math.random(0.5, 2));
			}
			if (cylinderRef.current) {
				uncollideAndDestroy(cylinderRef.current, math.random(0.5, 2));
			}
		};
	}, [startPoint.X, startPoint.Y, endPoint.X, endPoint.Y, height, thickness, isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

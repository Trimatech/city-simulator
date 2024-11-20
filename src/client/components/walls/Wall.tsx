import { memo, useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { Point } from "shared/polybool/polybool";

import {
	calculateWallTransform,
	createWallPieces,
	setupCollisionGroup,
	startCrumbling,
	startFadeOut,
} from "./Walls.utils";

interface Props {
	startPoint: Point;
	endPoint: Point;
	color?: Color3;
	transparency?: number;
	height?: number;
	thickness?: number;
	position: Vector3;
	isCrumbling?: boolean;
}

function WallComponent({
	startPoint,
	endPoint,
	color = palette.white,
	transparency = 0,
	height = 5,
	thickness = 1,
	position = new Vector3(),
	isCrumbling = false,
}: Props) {
	const mainPartRef = useRef<Part>();
	const debrisRef = useRef<Part[]>([]);
	const cleanupRef = useRef<() => void>();

	const name = `wall_${startPoint[0]}_${startPoint[1]}_${endPoint[0]}_${endPoint[1]}`;

	// Main wall creation effect
	useEffect(() => {
		if (isCrumbling) return;

		setupCollisionGroup();
		const { width, center, rotation } = calculateWallTransform([startPoint, endPoint], position, height);

		// Create single wall part
		const part = new Instance("Part");
		part.Name = name;
		part.Size = new Vector3(width, height, thickness);
		part.Color = color;
		part.Transparency = transparency;
		part.Material = Enum.Material.SmoothPlastic;
		part.TopSurface = Enum.SurfaceType.Smooth;
		part.BottomSurface = Enum.SurfaceType.Smooth;
		part.Anchored = true;
		part.CanCollide = false;
		part.CFrame = new CFrame(center).mul(rotation);
		part.Parent = Workspace;

		mainPartRef.current = part;

		return () => {
			if (mainPartRef.current) {
				mainPartRef.current.Destroy();
				mainPartRef.current = undefined;
			}
		};
	}, [
		startPoint[0],
		startPoint[1],
		endPoint[0],
		endPoint[1],
		color,
		transparency,
		height,
		thickness,
		position,
		isCrumbling,
	]);

	// Crumbling effect
	useEffect(() => {
		if (!isCrumbling) return;

		// Clean up main wall if it exists
		if (mainPartRef.current) {
			mainPartRef.current.Destroy();
			mainPartRef.current = undefined;
		}

		const { width, center, rotation } = calculateWallTransform([startPoint, endPoint], position, height);

		// Create debris pieces
		const pieces = createWallPieces({
			position: center,
			size: new Vector3(width, height, thickness),
			rotation: rotation,
			color: color,
			transparency: transparency,
		});

		// Add pieces to workspace
		pieces.forEach((piece) => (piece.Parent = Workspace));

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

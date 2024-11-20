import Object from "@rbxts/object-utils";
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
	line: [Point, Point];
	color?: Color3;
	transparency?: number;
	height?: number;
	thickness?: number;
	position: Vector3;
	isCrumbling?: boolean;
	isDynamic?: boolean;
}

function WallComponent({
	line,
	color = palette.white,
	transparency = 0,
	height = 5,
	thickness = 1,
	position = new Vector3(),
	isCrumbling = false,
	isDynamic = false,
}: Props) {
	const mainPartRef = useRef<Part>();
	const debrisRef = useRef<Part[]>([]);
	const cleanupRef = useRef<() => void>();

	const name = `wall_${line[0][0]}_${line[0][1]}_${line[1][0]}_${line[1][1]}`;

	warn(`render ${name}`);

	// Main wall creation effect
	useEffect(() => {
		if (isCrumbling) return;

		setupCollisionGroup();
		const { width, center, rotation } = calculateWallTransform(line, position, height);

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
	}, [line, color, transparency, height, thickness, position, isCrumbling]);

	// Crumbling effect
	useEffect(() => {
		if (!isCrumbling) return;

		// Clean up main wall if it exists
		if (mainPartRef.current) {
			mainPartRef.current.Destroy();
			mainPartRef.current = undefined;
		}

		const { width, center, rotation } = calculateWallTransform(line, position, height);

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

export const Wall = memo(WallComponent, (prevProps, nextProps) => {
	const propsAreEqual = (prevProps: Props, nextProps: Props) => {
		for (const key of Object.keys(nextProps)) {
			if (key !== "line" && nextProps[key] !== prevProps[key]) {
				return false;
			}
		}
		if (nextProps.isDynamic && prevProps.line !== nextProps.line) {
			return false;
		}
		return true;
	};
	return propsAreEqual(prevProps, nextProps);
});

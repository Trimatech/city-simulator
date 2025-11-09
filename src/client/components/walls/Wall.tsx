import { memo, useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getWallSkin } from "shared/constants/skins";
import { selectGridResolution } from "shared/store/grid/grid-selectors";

import {
	calculateWallTransform,
	computeWallJoinForCell,
	createCylinder,
	createWallHighlight,
	createWallPart,
	getEndpointWorldPosition,
	positionWallAtGround,
	tweenWallToTarget,
	uncollideAndDestroy,
	WALL_JOIN_DEFAULTS,
	WallJoinConfig,
} from "./Walls.utils";

const WALL_MATERIAL = Enum.Material.SmoothPlastic;

interface Appearance {
	color: Color3;
	material: Enum.Material;
	transparency: number;
}

type ResolvedWallSkin = { type: "tint"; appearance: Appearance } | { type: "part"; modelPath: string };

function resolveWallSkin({
	skinId,
	fallbackColor,
	transparency,
}: {
	skinId?: string;
	fallbackColor: Color3;
	transparency: number;
}): ResolvedWallSkin {
	if (skinId !== undefined) {
		const wallSkin = getWallSkin(skinId);
		if (wallSkin?.type === "part") {
			return { type: "part", modelPath: wallSkin.modelPath };
		}

		if (wallSkin?.type === "tint") {
			return { type: "tint", appearance: { color: wallSkin.tint, material: WALL_MATERIAL, transparency } };
		}
	}
	return { type: "tint", appearance: { color: fallbackColor, material: WALL_MATERIAL, transparency } };
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
	cellKey?: string;
	startPoint: Vector2;
	endPoint: Vector2;
	startMiterFactor?: number;
	endMiterFactor?: number;
	startNeighborDir?: Vector2;
	endNeighborDir?: Vector2;
	joinConfig?: WallJoinConfig;
	color?: Color3;
	transparency?: number;
	height: number;
	thickness?: number;
	isCrumbling?: boolean;
	skinId?: string;
	kind: "tracer" | "area" | "area2";
	outline?: boolean;
	crumbleDelaySeconds?: number;
	zIndex?: number;
}

function WallComponent({
	folderName,
	cellKey,
	startPoint,
	endPoint,
	startMiterFactor,
	endMiterFactor,
	startNeighborDir,
	endNeighborDir,
	joinConfig,
	color = palette.white,
	transparency = 0,
	height,
	thickness = 1,
	isCrumbling = false,
	skinId,
	kind,
	outline = false,
	zIndex,
}: Props) {
	const mainPartRef = useRef<BasePart>();
	const cylinderRef = useRef<Part>();
	const filletStartRef = useRef<Part>();
	const filletEndRef = useRef<Part>();
	const outlineRef = useRef<Highlight>();
	const hasAnimatedRef = useRef(false);
	const tweenCleanupRef = useRef<() => void>();
	const gridResolution = useSelector(selectGridResolution);

	function ensureFilletCylinder(ref: React.MutableRefObject<Part | undefined>, folder: Folder) {
		if (!ref.current) {
			const cyl = new Instance("Part");
			cyl.Name = "wall_fillet";
			cyl.Shape = Enum.PartType.Cylinder;
			cyl.Anchored = true;
			cyl.CanCollide = false;
			cyl.TopSurface = Enum.SurfaceType.Smooth;
			cyl.BottomSurface = Enum.SurfaceType.Smooth;
			cyl.Parent = folder;
			ref.current = cyl;
		}
		return ref.current!;
	}

	//print(`rendering wall ${folderName} ${startPoint.X},${startPoint.Y} -> ${endPoint.X},${endPoint.Y}`);

	// Create wall parts once
	useEffect(() => {
		if (isCrumbling) return;

		let cancelled = false;
		(async () => {
			const folder = ensureFolder(folderName);

			const yOffsetExtra = (zIndex ?? 0) * 0.0001;
			const { width, center, rotation, startPosition } = calculateWallTransform(
				[startPoint, endPoint],
				height,
				yOffsetExtra,
			);

			const resolved = resolveWallSkin({
				skinId,
				fallbackColor: color,
				transparency,
			});

			let part: BasePart;
			if (resolved.type === "part") {
				part = await createWallPart({
					folderName,
					width,
					height,
					thickness,
					center,
					rotation,
					modelPath: resolved.modelPath,
				});
			} else {
				part = await createWallPart({
					folderName,
					width,
					height,
					thickness,
					center,
					rotation,
					color: resolved.appearance.color,
					transparency: resolved.appearance.transparency,
					material: resolved.appearance.material,
				});
			}
			if (cancelled) {
				part.Destroy();
				return;
			}
			part.Parent = folder;

			if (resolved.type === "tint") {
				const cylinder = createCylinder({
					folderName,
					height,
					thickness,
					startPosition,
					color,
					transparency: 1,
					material: WALL_MATERIAL,
				});
				cylinder.Parent = folder;
				cylinderRef.current = cylinder;
			}

			// Start at ground level only if we intend to animate (non-tracer)
			if (kind !== "tracer") {
				positionWallAtGround({ part, cylinder: cylinderRef.current, center, rotation, startPosition });
			}

			if (outline) {
				outlineRef.current = createWallHighlight(part);
			}

			mainPartRef.current = part;
		})();

		return () => {
			cancelled = true;
			if (tweenCleanupRef.current) tweenCleanupRef.current();
			if (outlineRef.current) outlineRef.current.Destroy();
			if (mainPartRef.current) uncollideAndDestroy(mainPartRef.current, math.random(0.5, 2));
			if (cylinderRef.current) uncollideAndDestroy(cylinderRef.current, math.random(0.5, 2));
			if (filletStartRef.current) uncollideAndDestroy(filletStartRef.current, math.random(0.5, 2));
			if (filletEndRef.current) uncollideAndDestroy(filletEndRef.current, math.random(0.5, 2));
		};
		// create once; subsequent updates handled by effects below
	}, []);

	// Update transform (position/size/orientation) on geometry changes
	useEffect(() => {
		const part = mainPartRef.current;
		const cylinder = cylinderRef.current;
		if (!part) return;

		// miter/fillet math lives in Walls.utils

		const yOffsetExtra = (zIndex ?? 0) * 0.0001;
		const { width, center, rotation, startPosition } = calculateWallTransform(
			[startPoint, endPoint],
			height,
			yOffsetExtra,
		);

		// Compute join deltas using util (configurable)
		const { extA, extB, acuteA, acuteB } = computeWallJoinForCell({
			cellKey,
			gridResolution,
			thickness,
			segmentWidth: width,
			a: startPoint,
			b: endPoint,
			startNeighborDir,
			endNeighborDir,
			startMiterFactor,
			endMiterFactor,
			config: joinConfig ?? WALL_JOIN_DEFAULTS,
		});
		const newWidth = width + extA + extB;
		part.Size = new Vector3(newWidth, height, thickness);
		if (cylinder) {
			cylinder.Size = new Vector3(height, thickness, thickness);
		}
		// Manage fillet cylinders for acute corners
		const folder = ensureFolder(folderName);
		const appearanceColor = part.Color;
		const appearanceMaterial = part.Material;
		const appearanceTransparency = part.Transparency;
		if (acuteA) {
			const c = ensureFilletCylinder(filletStartRef, folder);
			c.Size = new Vector3(height, thickness, thickness);
			c.Color = appearanceColor;
			c.Material = appearanceMaterial;
			c.Transparency = appearanceTransparency;
			const pos = getEndpointWorldPosition(startPoint, height, yOffsetExtra);
			const cf = new CFrame(pos).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)));
			c.CFrame = cf;
		} else if (filletStartRef.current) {
			filletStartRef.current.Destroy();
			filletStartRef.current = undefined;
		}
		if (acuteB) {
			const c = ensureFilletCylinder(filletEndRef, folder);
			c.Size = new Vector3(height, thickness, thickness);
			c.Color = appearanceColor;
			c.Material = appearanceMaterial;
			c.Transparency = appearanceTransparency;
			const pos = getEndpointWorldPosition(endPoint, height, yOffsetExtra);
			const cf = new CFrame(pos).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)));
			c.CFrame = cf;
		} else if (filletEndRef.current) {
			filletEndRef.current.Destroy();
			filletEndRef.current = undefined;
		}

		const targetPartCFrame = new CFrame(center).mul(rotation);
		const targetCylinderCFrame = new CFrame(startPosition).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)));

		const shouldAnimate = !hasAnimatedRef.current && kind !== "tracer";
		if (shouldAnimate && cylinder) {
			// Position from ground then tween to targets
			positionWallAtGround({ part, cylinder, center, rotation, startPosition });
			tweenCleanupRef.current = tweenWallToTarget({
				part,
				cylinder,
				targetPartCFrame,
				targetCylinderCFrame,
				duration: 0.8,
			});
			hasAnimatedRef.current = true;
			return;
		}

		// Apply transforms directly (for tracer or subsequent updates)
		// Shift center along length to account for unequal extensions
		{
			// use same deltas for shift
			const extA2 = extA;
			const extB2 = extB;
			const shift = (extB2 - extA2) / 2;
			part.CFrame = targetPartCFrame.add(targetPartCFrame.RightVector.mul(shift));
		}
		if (cylinder) {
			cylinder.CFrame = targetCylinderCFrame;
		}
		hasAnimatedRef.current = true;
	}, [
		startPoint.X,
		startPoint.Y,
		endPoint.X,
		endPoint.Y,
		height,
		thickness,
		startMiterFactor,
		endMiterFactor,
		startNeighborDir && startNeighborDir.X,
		startNeighborDir && startNeighborDir.Y,
		endNeighborDir && endNeighborDir.X,
		endNeighborDir && endNeighborDir.Y,
	]);

	// Update visuals (color/material/transparency) when appearance props change
	useEffect(() => {
		const part = mainPartRef.current;
		const cylinder = cylinderRef.current;
		if (!part) return;

		const resolved = resolveWallSkin({
			skinId,
			fallbackColor: color,
			transparency,
		});

		if (resolved.type === "tint") {
			part.Color = resolved.appearance.color;
			part.Transparency = resolved.appearance.transparency;
			part.Material = resolved.appearance.material;

			if (cylinder) {
				cylinder.Color = resolved.appearance.color;
				cylinder.Transparency = resolved.appearance.transparency;
				cylinder.Material = resolved.appearance.material;
			}
			return;
		}

		// For model-based skins, preserve the part's native look and hide the cylinder
		if (cylinder) cylinder.Transparency = 1;
	}, [color, transparency, skinId, kind]);

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
		if (tweenCleanupRef.current) {
			tweenCleanupRef.current();
			tweenCleanupRef.current = undefined;
		}
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
		if (filletStartRef.current) {
			uncollideAndDestroy(filletStartRef.current, math.random(0.5, 2));
			filletStartRef.current = undefined;
		}
		if (filletEndRef.current) {
			uncollideAndDestroy(filletEndRef.current, math.random(0.5, 2));
			filletEndRef.current = undefined;
		}
	}, [isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

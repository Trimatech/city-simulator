import { memo, useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getSoldierSkin } from "shared/constants/skins";
import { getWallSkin } from "shared/constants/walls/skins";
import { selectGridResolution } from "shared/store/grid/grid-selectors";
import { getCellAABBFromCoord } from "shared/utils/cell-key";

import {
	calculateWallTransform,
	createCylinder,
	createWallHighlight,
	createWallPart,
	positionWallAtGround,
	tweenWallToTarget,
	uncollideAndDestroy,
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
		if (wallSkin && wallSkin.type === "part") {
			return { type: "part", modelPath: wallSkin.modelPath };
		}
		const soldierSkin = getSoldierSkin(skinId);
		return {
			type: "tint",
			appearance: { color: soldierSkin.tint, material: WALL_MATERIAL, transparency },
		};
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
	const outlineRef = useRef<Highlight>();
	const hasAnimatedRef = useRef(false);
	const tweenCleanupRef = useRef<() => void>();
	const gridResolution = useSelector(selectGridResolution);

	function parseCellKeyToCoord(key: string): Vector2 {
		const parts = key.split(",");
		const x = tonumber(parts[0]) ?? 0;
		const y = tonumber(parts[1]) ?? 0;
		return new Vector2(x, y);
	}

	function pointInAABB(p: Vector2, min: Vector2, max: Vector2) {
		return p.X >= min.X && p.X <= max.X && p.Y >= min.Y && p.Y <= max.Y;
	}

	//print(`rendering wall ${folderName} ${startPoint.X},${startPoint.Y} -> ${endPoint.X},${endPoint.Y}`);

	print("rendering properties", startMiterFactor, endMiterFactor);

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
		};
		// create once; subsequent updates handled by effects below
	}, []);

	// Update transform (position/size/orientation) on geometry changes
	useEffect(() => {
		const part = mainPartRef.current;
		const cylinder = cylinderRef.current;
		if (!part) return;

		function computeExtForEndpoint(
			isStart: boolean,
			segmentStart: Vector2,
			segmentEnd: Vector2,
			neighborDir?: Vector2,
		) {
			if (!neighborDir) return 0;
			const segDir = isStart ? segmentEnd.sub(segmentStart) : segmentStart.sub(segmentEnd);
			if (segDir.Magnitude < 1e-6 || neighborDir.Magnitude < 1e-6) return 0;
			const u = segDir.Unit;
			const v = neighborDir.Unit;
			const dot = math.clamp(u.Dot(v), -1, 1);
			const theta = math.acos(dot);
			if (theta <= 1e-3 || math.abs(theta - math.pi) <= 1e-3) return 0;
			const half = theta / 2;
			const t = math.tan(half);
			if (math.abs(t) < 1e-6) return 0;
			const w = thickness / 2;
			const ext = w / t; // exact miter extension per side
			return ext > 0 ? ext : 0;
		}

		const yOffsetExtra = (zIndex ?? 0) * 0.0001;
		const { width, center, rotation, startPosition } = calculateWallTransform(
			[startPoint, endPoint],
			height,
			yOffsetExtra,
		);

		// Extend ends using miter factors to close outer corners (applies to all kinds)
		let extAraw = 0;
		let extBraw = 0;
		if (cellKey !== undefined) {
			const cellCoord = parseCellKeyToCoord(cellKey);
			const [cellMin, cellMax] = getCellAABBFromCoord(cellCoord, gridResolution);
			const useA = pointInAABB(startPoint, cellMin, cellMax);
			const useB = pointInAABB(endPoint, cellMin, cellMax);
			// Prefer precise neighbor-based computation when available
			const extAprecise = useA ? computeExtForEndpoint(true, startPoint, endPoint, startNeighborDir) : 0;
			const extBprecise = useB ? computeExtForEndpoint(false, startPoint, endPoint, endNeighborDir) : 0;
			const extAfromFactor = useA ? thickness * (startMiterFactor ?? 0) : 0;
			const extBfromFactor = useB ? thickness * (endMiterFactor ?? 0) : 0;
			extAraw = extAprecise > 0 ? extAprecise : extAfromFactor;
			extBraw = extBprecise > 0 ? extBprecise : extBfromFactor;
		}
		// Clamp to avoid overshoot on very short segments
		const cap = width * 0.45;
		const extA = math.min(extAraw, cap);
		const extB = math.min(extBraw, cap);
		const newWidth = width + extA + extB;
		part.Size = new Vector3(newWidth, height, thickness);
		if (cylinder) {
			cylinder.Size = new Vector3(height, thickness, thickness);
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
			let extAraw2 = 0;
			let extBraw2 = 0;
			if (cellKey !== undefined) {
				const cellCoord = parseCellKeyToCoord(cellKey);
				const [cellMin, cellMax] = getCellAABBFromCoord(cellCoord, gridResolution);
				const useA = pointInAABB(startPoint, cellMin, cellMax);
				const useB = pointInAABB(endPoint, cellMin, cellMax);
				const extAprecise2 = useA ? computeExtForEndpoint(true, startPoint, endPoint, startNeighborDir) : 0;
				const extBprecise2 = useB ? computeExtForEndpoint(false, startPoint, endPoint, endNeighborDir) : 0;
				const extAfromFactor2 = useA ? thickness * (startMiterFactor ?? 0) : 0;
				const extBfromFactor2 = useB ? thickness * (endMiterFactor ?? 0) : 0;
				extAraw2 = extAprecise2 > 0 ? extAprecise2 : extAfromFactor2;
				extBraw2 = extBprecise2 > 0 ? extBprecise2 : extBfromFactor2;
			}
			const cap2 = (part.Size.X > 0 ? part.Size.X : 0) * 0.45; // use current width as a reference
			const extA2 = math.min(extAraw2, cap2);
			const extB2 = math.min(extBraw2, cap2);
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
	}, [isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

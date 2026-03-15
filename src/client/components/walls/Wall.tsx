import { memo, useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { palette } from "shared/constants/palette";
import { getWallSkin } from "shared/constants/skins";

import {
	calculateWallTransform,
	createWallHighlight,
	createWallPartOld,
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
	startPoint,
	endPoint,
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
	const outlineRef = useRef<Highlight>();
	const hasAnimatedRef = useRef(false);
	const tweenCleanupRef = useRef<() => void>();

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
				part = await createWallPartOld({
					folderName,
					width,
					height,
					thickness,
					center,
					rotation,
					modelPath: resolved.modelPath,
				});
			} else {
				part = await createWallPartOld({
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

			// Start at ground level for animation (all wall types including tracers)
			positionWallAtGround({ part, center, rotation, startPosition });

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
		};
		// create once; subsequent updates handled by effects below
	}, []);

	// Update transform (position/size/orientation) on geometry changes
	useEffect(() => {
		const part = mainPartRef.current;
		if (!part) return;

		const yOffsetExtra = (zIndex ?? 0) * 0.0001;
		const { width, center, rotation, startPosition } = calculateWallTransform(
			[startPoint, endPoint],
			height,
			yOffsetExtra,
		);

		part.Size = new Vector3(width, height, thickness);

		const targetPartCFrame = new CFrame(center).mul(rotation);
		const targetCylinderCFrame = new CFrame(startPosition).mul(CFrame.fromEulerAnglesXYZ(0, 0, math.rad(90)));

		const shouldAnimate = !hasAnimatedRef.current;
		if (shouldAnimate) {
			// Position from ground then tween to targets
			positionWallAtGround({ part, center, rotation, startPosition });
			tweenCleanupRef.current = tweenWallToTarget({
				part,
				targetPartCFrame,
				targetCylinderCFrame,
				duration: 0.8,
			});
			hasAnimatedRef.current = true;
			return;
		}

		// Apply transforms directly (for tracer or subsequent updates)
		part.CFrame = targetPartCFrame;
		hasAnimatedRef.current = true;
	}, [startPoint.X, startPoint.Y, endPoint.X, endPoint.Y, height, thickness]);

	// Update visuals (color/material/transparency) when appearance props change
	useEffect(() => {
		const part = mainPartRef.current;
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
			return;
		}
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
	}, [isCrumbling]);

	return undefined;
}

export const Wall = memo(WallComponent);

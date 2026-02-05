import { CollectionService, TweenService, Workspace } from "@rbxts/services";
import { getObserverPosition2D } from "client/utils/camera-position.utils";
import {
	WALL_ANIMATION_THRESHOLD,
	WALL_ATTR_SKIN_ID,
	WALL_ATTR_TARGET_Y,
	WALL_ATTR_TIME_ADDED,
	WALL_TAG,
} from "shared/constants/core";
import { getWallSkin } from "shared/constants/skins";

const ANIMATION_DURATION = 0.8;
const WALL_ANIMATION_DISTANCE_THRESHOLD = 150; // Don't animate walls farther than this

// Track which parts we've already processed
const processedParts = new Set<BasePart>();

// Track active tweens for cleanup
const activeTweens = new Map<BasePart, Tween>();

function getTargetCFrame(part: BasePart): CFrame {
	let targetY = part.GetAttribute(WALL_ATTR_TARGET_Y) as number | undefined;

	// Check for streaming/replication issues
	if (targetY === undefined) {
		warn(`[WallAnimator] Missing WALL_ATTR_TARGET_Y on part "${part.Name}", using fallback`);
	}

	// Check if Size seems invalid (streaming issue - part not fully loaded)
	if (part.Size.Y <= 0 || part.Size.Y > 100) {
		warn(`[WallAnimator] Suspicious Size.Y=${part.Size.Y} on part "${part.Name}"`);
	}

	// Fallback: calculate targetY from part height if attribute is missing
	// Uses the same formula as the server: height / 2 - 1
	if (targetY === undefined) {
		targetY = part.Size.Y / 2 - 1;
	}

	const currentPos = part.Position;
	return new CFrame(new Vector3(currentPos.X, targetY, currentPos.Z)).mul(
		part.CFrame.sub(part.Position), // Preserve rotation
	);
}

function applySkin(part: BasePart): void {
	const skinId = part.GetAttribute(WALL_ATTR_SKIN_ID) as string | undefined;
	if (!skinId) return;

	const skin = getWallSkin(skinId);
	// Apply the tint color (works for both tint and part skins since part skins also have a tint)
	part.Color = skin.tint;
}

function animateWallUp(part: BasePart): void {
	const targetCFrame = getTargetCFrame(part);

	const tweenInfo = new TweenInfo(ANIMATION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
	const tween = TweenService.Create(part, tweenInfo, { CFrame: targetCFrame });

	// Store tween for potential cleanup
	activeTweens.set(part, tween);

	tween.Completed.Once(() => {
		activeTweens.delete(part);
	});

	tween.Play();
}

function setWallToTarget(part: BasePart): void {
	const targetCFrame = getTargetCFrame(part);
	part.CFrame = targetCFrame;

	// Verify the CFrame took effect after a short delay (replication might overwrite)
	task.delay(0.1, () => {
		const expectedY = targetCFrame.Position.Y;
		const actualY = part.Position.Y;
		// If replication overwrote our change, re-apply
		if (math.abs(actualY - expectedY) > 1) {
			warn(
				`[WallAnimator] Part "${part.Name}" was reset by replication (expected Y=${expectedY}, got Y=${actualY}), re-applying`,
			);
			part.CFrame = targetCFrame;
		}
	});
}

function isWallTooFar(part: BasePart): boolean {
	const observerPos = getObserverPosition2D();
	if (!observerPos) return false;

	const partPos = part.Position;
	const dx = partPos.X - observerPos.X;
	const dz = partPos.Z - observerPos.Y; // observerPos.Y is the Z coordinate in 2D
	const distanceSquared = dx * dx + dz * dz;

	return distanceSquared > WALL_ANIMATION_DISTANCE_THRESHOLD * WALL_ANIMATION_DISTANCE_THRESHOLD;
}

function processWallPart(part: BasePart): void {
	if (processedParts.has(part)) return;
	processedParts.add(part);

	// Check if part is properly streamed in
	if (!part.IsDescendantOf(Workspace)) {
		warn(`[WallAnimator] Part "${part.Name}" is not in Workspace yet (streaming issue?)`);
	}

	// Apply skin color
	applySkin(part);

	const timeAdded = part.GetAttribute(WALL_ATTR_TIME_ADDED) as number | undefined;
	if (timeAdded === undefined) {
		// No time attribute - could be streaming issue or old part
		warn(`[WallAnimator] Missing WALL_ATTR_TIME_ADDED on part "${part.Name}", setting to target directly`);
		setWallToTarget(part);
		return;
	}

	const currentTime = Workspace.GetServerTimeNow();
	const elapsed = currentTime - timeAdded;

	if (elapsed < WALL_ANIMATION_THRESHOLD && !isWallTooFar(part)) {
		// Animate up (only if recent and close enough to player)
		animateWallUp(part);
	} else {
		// Too old or too far, set directly
		setWallToTarget(part);
	}
}

function handlePartAdded(part: Instance): void {
	if (!part.IsA("BasePart")) {
		warn(`[WallAnimator] Tagged instance "${part.Name}" is not a BasePart (got ${part.ClassName})`);
		return;
	}

	// Defer processing to next frame to ensure part is fully replicated
	// With streaming, the tag might fire before the part is fully set up
	task.defer(() => {
		// Wait for part to be in Workspace if it isn't yet
		if (!part.IsDescendantOf(Workspace)) {
			// Part not in workspace yet, wait for it
			const conn = part.AncestryChanged.Connect((_, newParent) => {
				if (newParent && part.IsDescendantOf(Workspace)) {
					conn.Disconnect();
					// Defer again to let properties settle
					task.defer(() => processWallPart(part));
				}
			});
			// Timeout cleanup - if part never enters workspace, disconnect
			task.delay(5, () => conn.Disconnect());
		} else {
			processWallPart(part);
		}
	});
}

function handlePartRemoving(part: Instance): void {
	if (!part.IsA("BasePart")) return;

	// Cancel any active tween
	const tween = activeTweens.get(part);
	if (tween) {
		tween.Cancel();
		activeTweens.delete(part);
	}

	processedParts.delete(part);
}

let initialized = false;
let addedConnection: RBXScriptConnection | undefined;
let removingConnection: RBXScriptConnection | undefined;

export function initializeWallAnimator(): void {
	if (initialized) return;
	initialized = true;

	// Process existing tagged parts
	for (const part of CollectionService.GetTagged(WALL_TAG)) {
		handlePartAdded(part);
	}

	// Listen for new parts being tagged
	addedConnection = CollectionService.GetInstanceAddedSignal(WALL_TAG).Connect(handlePartAdded);

	// Listen for parts being removed
	removingConnection = CollectionService.GetInstanceRemovedSignal(WALL_TAG).Connect(handlePartRemoving);
}

export function cleanupWallAnimator(): void {
	if (!initialized) return;

	addedConnection?.Disconnect();
	removingConnection?.Disconnect();

	// Cancel all active tweens
	for (const [, tween] of activeTweens) {
		tween.Cancel();
	}
	activeTweens.clear();
	processedParts.clear();

	initialized = false;
}

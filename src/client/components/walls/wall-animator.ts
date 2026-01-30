import { CollectionService, TweenService, Workspace } from "@rbxts/services";
import {
	WALL_ANIMATION_THRESHOLD,
	WALL_ATTR_SKIN_ID,
	WALL_ATTR_TARGET_Y,
	WALL_ATTR_TIME_ADDED,
	WALL_TAG,
} from "shared/constants/core";
import { getWallSkin } from "shared/constants/skins";
import { getObserverPosition2D } from "client/utils/camera-position.utils";

const ANIMATION_DURATION = 0.8;
const WALL_ANIMATION_DISTANCE_THRESHOLD = 150; // Don't animate walls farther than this

// Track which parts we've already processed
const processedParts = new Set<BasePart>();

// Track active tweens for cleanup
const activeTweens = new Map<BasePart, Tween>();

function getTargetCFrame(part: BasePart): CFrame {
	const targetY = part.GetAttribute(WALL_ATTR_TARGET_Y) as number | undefined;
	if (targetY === undefined) return part.CFrame;

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

	// Apply skin color
	applySkin(part);

	const timeAdded = part.GetAttribute(WALL_ATTR_TIME_ADDED) as number | undefined;
	if (timeAdded === undefined) {
		// No time attribute, just set to target
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
	if (!part.IsA("BasePart")) return;
	processWallPart(part);
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

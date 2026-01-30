import { CollectionService, TweenService, Workspace } from "@rbxts/services";
import {
	CANDY_ATTR_EATEN,
	CANDY_ATTR_ID,
	CANDY_ATTR_SIZE,
	CANDY_ATTR_TARGET_Y,
	CANDY_ATTR_TIME_ADDED,
	CANDY_EAT_ANIMATION_DURATION,
	CANDY_EAT_FINAL_SIZE,
	CANDY_EAT_FLOAT_HEIGHT,
	CANDY_SPAWN_ANIMATION_DURATION,
	CANDY_TAG,
} from "shared/constants/core";

// Track which parts we've already processed for spawn animation
const spawnAnimatedParts = new Set<BasePart>();

// Track active tweens for cleanup
const activeTweens = new Map<BasePart, Tween[]>();

// Track parts that have eaten animation running
const eatenParts = new Set<BasePart>();

function getTargetPosition(part: BasePart): Vector3 {
	const targetY = part.GetAttribute(CANDY_ATTR_TARGET_Y) as number | undefined;
	if (targetY === undefined) return part.Position;

	return new Vector3(part.Position.X, targetY, part.Position.Z);
}

function animateCandySpawn(part: BasePart): void {
	const targetPosition = getTargetPosition(part);

	const tweenInfo = new TweenInfo(CANDY_SPAWN_ANIMATION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
	const tween = TweenService.Create(part, tweenInfo, { Position: targetPosition });

	// Store tween for potential cleanup
	const tweens = activeTweens.get(part) ?? [];
	tweens.push(tween);
	activeTweens.set(part, tweens);

	tween.Completed.Once(() => {
		const t = activeTweens.get(part);
		if (t) {
			const idx = t.indexOf(tween);
			if (idx >= 0) t.remove(idx);
			if (t.size() === 0) activeTweens.delete(part);
		}
	});

	tween.Play();
}

function animateCandyEaten(part: BasePart): void {
	if (eatenParts.has(part)) return;
	eatenParts.add(part);

	const startPosition = part.Position;
	const endPosition = startPosition.add(new Vector3(0, CANDY_EAT_FLOAT_HEIGHT, 0));
	const endSize = new Vector3(CANDY_EAT_FINAL_SIZE, CANDY_EAT_FINAL_SIZE, CANDY_EAT_FINAL_SIZE);

	const positionTweenInfo = new TweenInfo(
		CANDY_EAT_ANIMATION_DURATION,
		Enum.EasingStyle.Quad,
		Enum.EasingDirection.Out,
	);
	const sizeTweenInfo = new TweenInfo(CANDY_EAT_ANIMATION_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In);

	const positionTween = TweenService.Create(part, positionTweenInfo, { Position: endPosition });
	const sizeTween = TweenService.Create(part, sizeTweenInfo, { Size: endSize });

	// Store tweens for potential cleanup
	const tweens = activeTweens.get(part) ?? [];
	tweens.push(positionTween, sizeTween);
	activeTweens.set(part, tweens);

	positionTween.Play();
	sizeTween.Play();
}

function setCandyToTarget(part: BasePart): void {
	const targetPosition = getTargetPosition(part);
	part.Position = targetPosition;
}

function processSpawnAnimation(part: BasePart): void {
	if (spawnAnimatedParts.has(part)) return;
	spawnAnimatedParts.add(part);

	const timeAdded = part.GetAttribute(CANDY_ATTR_TIME_ADDED) as number | undefined;
	if (timeAdded === undefined) {
		// No time attribute, just set to target
		setCandyToTarget(part);
		return;
	}

	const currentTime = Workspace.GetServerTimeNow();
	const elapsed = currentTime - timeAdded;

	// Animate spawn if candy was created recently (within 5 seconds)
	if (elapsed < 5) {
		animateCandySpawn(part);
	} else {
		setCandyToTarget(part);
	}
}

function checkEatenState(part: BasePart): void {
	const eaten = part.GetAttribute(CANDY_ATTR_EATEN) as boolean | undefined;
	if (eaten === true && !eatenParts.has(part)) {
		animateCandyEaten(part);
	}
}

function handlePartAdded(part: Instance): void {
	if (!part.IsA("BasePart")) return;

	// Process spawn animation
	processSpawnAnimation(part);

	// Check if already eaten
	checkEatenState(part);

	// Listen for eaten attribute changes
	part.GetAttributeChangedSignal(CANDY_ATTR_EATEN).Connect(() => {
		checkEatenState(part);
	});
}

function handlePartRemoving(part: Instance): void {
	if (!part.IsA("BasePart")) return;

	// Cancel any active tweens
	const tweens = activeTweens.get(part);
	if (tweens) {
		for (const tween of tweens) {
			tween.Cancel();
		}
		activeTweens.delete(part);
	}

	spawnAnimatedParts.delete(part);
	eatenParts.delete(part);
}

let initialized = false;
let addedConnection: RBXScriptConnection | undefined;
let removingConnection: RBXScriptConnection | undefined;

export function initializeCandyAnimator(): void {
	if (initialized) return;
	initialized = true;

	// Process existing tagged parts
	for (const part of CollectionService.GetTagged(CANDY_TAG)) {
		handlePartAdded(part);
	}

	// Listen for new parts being tagged
	addedConnection = CollectionService.GetInstanceAddedSignal(CANDY_TAG).Connect(handlePartAdded);

	// Listen for parts being removed
	removingConnection = CollectionService.GetInstanceRemovedSignal(CANDY_TAG).Connect(handlePartRemoving);
}

export function cleanupCandyAnimator(): void {
	if (!initialized) return;

	addedConnection?.Disconnect();
	removingConnection?.Disconnect();

	// Cancel all active tweens
	for (const [, tweens] of activeTweens) {
		for (const tween of tweens) {
			tween.Cancel();
		}
	}
	activeTweens.clear();
	spawnAnimatedParts.clear();
	eatenParts.clear();

	initialized = false;
}

import { CollectionService, RunService, TweenService, Workspace } from "@rbxts/services";
import { playSound } from "shared/assetsFolder/sounds/play-sound";
import { sounds } from "shared/assetsFolder/sounds/sounds";
import { palette } from "shared/constants/palette";
import {
	REWARD_ATTR_COLLECTED,
	REWARD_ATTR_TIME_ADDED,
	REWARD_SPAWN_ANIMATION_DURATION,
	REWARD_TAG,
	REWARD_TARGET_Y,
} from "shared/constants/rewards";

const spawnAnimatedParts = new Set<BasePart>();
const activeTweens = new Map<BasePart, Tween[]>();
const collectedParts = new Set<BasePart>();
const idleConnections = new Map<BasePart, RBXScriptConnection>();

function getModel(part: BasePart): Model | undefined {
	const parent = part.Parent;
	if (parent && parent.IsA("Model")) return parent;
	return undefined;
}

function storeTween(part: BasePart, tween: Tween): void {
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
}

function animateRewardSpawn(part: BasePart): void {
	const model = getModel(part);
	if (!model) return;

	const targetCFrame = model.GetPivot().add(new Vector3(0, REWARD_TARGET_Y, 0));

	// Animate the primary part position; model follows via welds/joints
	const targetPosition = new Vector3(part.Position.X, part.Position.Y + REWARD_TARGET_Y, part.Position.Z);
	const tweenInfo = new TweenInfo(REWARD_SPAWN_ANIMATION_DURATION, Enum.EasingStyle.Back, Enum.EasingDirection.Out);
	const tween = TweenService.Create(part, tweenInfo, { Position: targetPosition });

	storeTween(part, tween);
	tween.Play();

	tween.Completed.Once(() => {
		// Snap the whole model to the target pivot
		model.PivotTo(targetCFrame);
		startIdleAnimation(part);
	});
}

function startIdleAnimation(part: BasePart): void {
	if (collectedParts.has(part)) return;
	if (idleConnections.has(part)) return;

	const model = getModel(part);
	if (!model) return;

	const basePivot = model.GetPivot();
	const bobAmplitude = 0.8;
	const spinSpeed = 1;
	let elapsed = 0;

	const connection = RunService.Heartbeat.Connect((dt) => {
		if (!model.Parent) return;
		elapsed += dt;
		const bobY = math.sin(elapsed * 2) * bobAmplitude;
		const angle = elapsed * spinSpeed;
		const bobOffset = new CFrame(0, bobY, 0).mul(CFrame.Angles(0, angle, 0));
		model.PivotTo(basePivot.mul(bobOffset));
	});

	idleConnections.set(part, connection);
}

function stopIdleAnimation(part: BasePart): void {
	const conn = idleConnections.get(part);
	if (conn) {
		conn.Disconnect();
		idleConnections.delete(part);
	}
}

function hideModel(part: BasePart): void {
	const model = getModel(part);
	if (model) {
		for (const desc of model.GetDescendants()) {
			if (desc.IsA("BasePart")) {
				desc.Transparency = 1;
			}
			if (desc.IsA("Beam")) {
				desc.Enabled = false;
			}
		}
	} else {
		part.Transparency = 1;
	}
}

const SPARKLE_COUNT = 8;
const SPARKLE_DURATION = 0.35;
const SPARKLE_DISTANCE = 7;
const FLASH_DURATION = 0.25;

function spawnStarFlash(position: Vector3): void {
	// Central flash sphere
	const flash = new Instance("Part");
	flash.Shape = Enum.PartType.Ball;
	flash.Material = Enum.Material.Neon;
	flash.Color = palette.white;
	flash.Size = new Vector3(1.5, 1.5, 1.5);
	flash.Position = position;
	flash.Anchored = true;
	flash.CanCollide = false;
	flash.CastShadow = false;
	flash.Transparency = 0.2;
	flash.Parent = Workspace;

	const light = new Instance("PointLight");
	light.Color = palette.sapphire;
	light.Brightness = 4;
	light.Range = 16;
	light.Parent = flash;

	const flashTween = TweenService.Create(
		flash,
		new TweenInfo(FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Size: new Vector3(5, 5, 5), Transparency: 1 },
	);
	const lightTween = TweenService.Create(
		light,
		new TweenInfo(FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
		{ Brightness: 0 },
	);
	flashTween.Play();
	lightTween.Play();
	flashTween.Completed.Once(() => flash.Destroy());

	// Sparkle particles shooting outward
	for (let i = 0; i < SPARKLE_COUNT; i++) {
		const angle = (i / SPARKLE_COUNT) * math.pi * 2;
		const sparkle = new Instance("Part");
		sparkle.Shape = Enum.PartType.Ball;
		sparkle.Material = Enum.Material.Neon;
		sparkle.Color = palette.sapphire;
		sparkle.Size = new Vector3(0.5, 0.5, 0.5);
		sparkle.Position = position;
		sparkle.Anchored = true;
		sparkle.CanCollide = false;
		sparkle.CastShadow = false;
		sparkle.Parent = Workspace;

		const dx = math.cos(angle) * SPARKLE_DISTANCE;
		const dy = math.random() * 3 - 0.5;
		const dz = math.sin(angle) * SPARKLE_DISTANCE;
		const endPos = position.add(new Vector3(dx, dy, dz));

		const moveTween = TweenService.Create(
			sparkle,
			new TweenInfo(SPARKLE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
			{ Position: endPos, Size: new Vector3(0.1, 0.1, 0.1), Transparency: 1 },
		);
		moveTween.Play();
		moveTween.Completed.Once(() => sparkle.Destroy());
	}
}

function animateRewardCollected(part: BasePart): void {
	if (collectedParts.has(part)) return;
	collectedParts.add(part);

	stopIdleAnimation(part);

	const position = part.Position.sub(new Vector3(0, 2, 0));

	// Instantly hide the model
	hideModel(part);

	// Star flash effect at model center
	spawnStarFlash(position);

	// Pickup sound
	playSound(sounds.bong_001, { volume: 0.7, pitchOctave: 1.3 });
}

function setRewardToTarget(part: BasePart): void {
	const model = getModel(part);
	if (model) {
		const pivot = model.GetPivot();
		model.PivotTo(pivot.add(new Vector3(0, REWARD_TARGET_Y, 0)));
	} else {
		part.Position = new Vector3(part.Position.X, part.Position.Y + REWARD_TARGET_Y, part.Position.Z);
	}
}

function processSpawnAnimation(part: BasePart): void {
	if (spawnAnimatedParts.has(part)) return;
	spawnAnimatedParts.add(part);

	const timeAdded = part.GetAttribute(REWARD_ATTR_TIME_ADDED) as number | undefined;
	if (timeAdded === undefined) {
		setRewardToTarget(part);
		startIdleAnimation(part);
		return;
	}

	const currentTime = Workspace.GetServerTimeNow();
	const elapsed = currentTime - timeAdded;

	if (elapsed < 5) {
		animateRewardSpawn(part);
	} else {
		setRewardToTarget(part);
		startIdleAnimation(part);
	}
}

function checkCollectedState(part: BasePart): void {
	const collected = part.GetAttribute(REWARD_ATTR_COLLECTED) as boolean | undefined;
	if (collected === true && !collectedParts.has(part)) {
		animateRewardCollected(part);
	}
}

function handlePartAdded(inst: Instance): void {
	if (!inst.IsA("BasePart")) return;

	processSpawnAnimation(inst);
	checkCollectedState(inst);

	inst.GetAttributeChangedSignal(REWARD_ATTR_COLLECTED).Connect(() => {
		checkCollectedState(inst);
	});
}

function handlePartRemoving(inst: Instance): void {
	if (!inst.IsA("BasePart")) return;

	const tweens = activeTweens.get(inst);
	if (tweens) {
		for (const tween of tweens) {
			tween.Cancel();
		}
		activeTweens.delete(inst);
	}

	stopIdleAnimation(inst);
	spawnAnimatedParts.delete(inst);
	collectedParts.delete(inst);
}

let initialized = false;
let addedConnection: RBXScriptConnection | undefined;
let removingConnection: RBXScriptConnection | undefined;

export function initializeRewardAnimator(): void {
	if (initialized) return;
	initialized = true;

	for (const part of CollectionService.GetTagged(REWARD_TAG)) {
		handlePartAdded(part);
	}

	addedConnection = CollectionService.GetInstanceAddedSignal(REWARD_TAG).Connect(handlePartAdded);
	removingConnection = CollectionService.GetInstanceRemovedSignal(REWARD_TAG).Connect(handlePartRemoving);
}

export function cleanupRewardAnimator(): void {
	if (!initialized) return;

	addedConnection?.Disconnect();
	removingConnection?.Disconnect();

	for (const [, tweens] of activeTweens) {
		for (const tween of tweens) {
			tween.Cancel();
		}
	}
	activeTweens.clear();
	spawnAnimatedParts.clear();
	collectedParts.clear();

	for (const [, conn] of idleConnections) {
		conn.Disconnect();
	}
	idleConnections.clear();

	initialized = false;
}

import { CollectionService, Players, TweenService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { findSharedInstanceByPath } from "shared/SharedModelManager";

const GROUND_TAG = "ground";

const DEFAULT_RUN_R6 = "rbxassetid://180426354";
const DEFAULT_RUN_R15 = "rbxassetid://507767714";

export function sampleGroundYAt(position: Vector2): number {
	const origin = new Vector3(position.X, 2048, position.Y);
	const direction = new Vector3(0, -8192, 0);
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.IgnoreWater = true;
	const taggedGround = CollectionService.GetTagged(GROUND_TAG);
	const includeList = [Workspace.Terrain as Instance, ...taggedGround];
	params.FilterDescendantsInstances = includeList;
	const result = Workspace.Raycast(origin, direction, params);
	return result ? result.Position.Y : 15;
}

export function computeStableGroundOffset(character: Model): number {
	// Prefer humanoid-based calculation which is stable across animation:
	// offset = HipHeight + (HRP height)/2
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	const hrp = character.FindFirstChild("HumanoidRootPart");
	if (humanoid && hrp && hrp.IsA("BasePart")) {
		return humanoid.HipHeight + hrp.Size.Y * 0.5;
	}

	// Next, try half of a primary/base part height
	if (hrp && hrp.IsA("BasePart")) {
		return hrp.Size.Y * 0.5;
	}

	// Finally, fallback to half of bounding box height if available
	const [, size] = character.GetBoundingBox();
	if (size.Y > 0) return size.Y * 0.5;

	return 2;
}

function findRunAnimation(character: Model): Animation | undefined {
	let candidate: Animation | undefined;
	character.GetDescendants().forEach((inst) => {
		if (inst.IsA("Animation")) {
			const name = string.lower(inst.Name);
			if (string.find(name, "run")[0] !== undefined) candidate = inst;
		}
	});
	return candidate;
}

function findRunAnimationIdFromAnimate(character: Model): string | undefined {
	let found: string | undefined = undefined;
	character.GetDescendants().forEach((inst) => {
		if (found !== undefined) return;
		if (inst.IsA("StringValue")) {
			const nameLower = string.lower(inst.Name);
			if (string.find(nameLower, "run")[0] !== undefined) {
				const value = (inst as StringValue).Value;
				if (string.find(string.lower(value), "rbxassetid")[0] !== undefined) found = value;
			}
		}
	});
	return found;
}

function pickDefaultRunAnimationId(humanoid: Humanoid): string {
	return humanoid.RigType === Enum.HumanoidRigType.R15 ? DEFAULT_RUN_R15 : DEFAULT_RUN_R6;
}

function chooseRandomPlayer(): Player | undefined {
	const players = Players.GetPlayers();
	if (players.size() === 0) {
		return undefined;
	}
	const random = new Random();
	return players[random.NextInteger(1, players.size()) - 1];
}

export function tryCloneRandomPlayerCharacter(): Model | undefined {
	const chosen = chooseRandomPlayer();

	if (!chosen) {
		warn("No player found");
		return undefined;
	}
	const source = chosen.Character as Model;
	if (!source) {
		warn("No character found");
		return undefined;
	}

	const prev = source.Archivable;
	source.Archivable = true;
	const clone = source.Clone();
	source.Archivable = prev;
	return clone;
}

export interface BotRuntime {
	readonly model: Model;
	animator?: Animator;
	runTrack?: AnimationTrack;
	posV?: Vector3Value;
	activeTween?: Tween;
	lastLookDir?: Vector3;
	groundOffset?: number;
}

export function tweenPosition(runtime: BotRuntime, target: Vector3, duration = WORLD_TICK) {
	if (!runtime.posV) {
		runtime.model.PivotTo(new CFrame(target));
		return;
	}

	const current = runtime.posV.Value;
	if (current.sub(target).Magnitude <= 1e-4) return;

	runtime.activeTween?.Cancel();
	const tween = TweenService.Create(
		runtime.posV,
		new TweenInfo(duration, Enum.EasingStyle.Linear, Enum.EasingDirection.In),
		{ Value: target },
	);
	runtime.activeTween = tween;
	tween.Completed.Once(() => {
		if (runtime.activeTween === tween) runtime.activeTween = undefined;
	});
	tween.Play();
}

export function ensureRun(runtime: BotRuntime) {
	if (runtime.runTrack && runtime.animator) return;
	const humanoid = runtime.model.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return;
	let animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		animator = new Instance("Animator");
		animator.Parent = humanoid;
	}
	let run = findRunAnimation(runtime.model);
	if (!run) {
		const idFromAnimate = findRunAnimationIdFromAnimate(runtime.model) ?? pickDefaultRunAnimationId(humanoid);
		run = new Instance("Animation");
		run.AnimationId = idFromAnimate;
		run.Name = "RunAuto";
		run.Parent = runtime.model;
	}
	const track = animator.LoadAnimation(run);
	track.Looped = true;
	track.Priority = Enum.AnimationPriority.Movement;
	runtime.runTrack = track;
	runtime.animator = animator;
}

export function setRunState(runtime: BotRuntime, isMoving: boolean) {
	ensureRun(runtime);
	const track = runtime.runTrack;
	if (!track) return;
	if (isMoving) {
		if (!track.IsPlaying) track.Play(0.1);
		track.AdjustSpeed(1);
		return;
	}
	if (track.IsPlaying) track.Stop(0.1);
}

export async function initializeBotRuntime(id: string, initial2D: Vector2): Promise<BotRuntime> {
	let source: Model | undefined;
	const existing = Workspace.FindFirstChild(id);
	if (existing && existing.IsA("Model")) {
		const prev = existing.Archivable;
		existing.Archivable = true;
		source = existing.Clone();
		existing.Archivable = prev;
	}
	if (!source) source = tryCloneRandomPlayerCharacter();
	if (!source) source = (await findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Characters/Noob")).Clone();

	const model = source!;
	model.Name = id;
	model.GetDescendants().forEach((inst) => {
		if (inst.IsA("BasePart")) {
			inst.Anchored = false;
			inst.CanCollide = false;
		}
	});
	const hrp = model.FindFirstChild("HumanoidRootPart") as BasePart;
	if (hrp) model.PrimaryPart = hrp;
	else {
		const first = model.FindFirstChildWhichIsA("BasePart");
		if (first) model.PrimaryPart = first;
	}
	model.Parent = Workspace;

	const animateScript = model.FindFirstChild("Animate");
	if (animateScript && (animateScript.IsA("LocalScript") || animateScript.IsA("Script"))) {
		(animateScript as LocalScript | Script).Disabled = true;
	}

	const humanoid = model.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		humanoid.AutoRotate = false;
		humanoid.ChangeState(Enum.HumanoidStateType.RunningNoPhysics);
	}

	const groundY = sampleGroundYAt(initial2D);
	const offset = computeStableGroundOffset(model);
	const start = new Vector3(initial2D.X, groundY + offset, initial2D.Y);
	model.PivotTo(new CFrame(start));

	const runtime: BotRuntime = { model, lastLookDir: new Vector3(0, 0, 1), groundOffset: offset };
	const posV = new Instance("Vector3Value");
	posV.Value = start;
	posV.Changed.Connect((newPos) => {
		const pos = newPos as Vector3;
		const dir = runtime.lastLookDir ?? new Vector3(0, 0, 1);
		runtime.model.PivotTo(CFrame.lookAt(pos, pos.add(dir), new Vector3(0, 1, 0)));
	});
	runtime.posV = posV;

	ensureRun(runtime);

	return runtime;
}

export function cleanupBotRuntime(runtime: BotRuntime) {
	runtime.activeTween?.Cancel();
	runtime.posV?.Destroy();
	runtime.model.Destroy();
}

function computeDesiredLookDirection(prev: Vector3 | undefined, delta2D: Vector2): Vector3 {
	if (delta2D.Magnitude <= 1e-6) return prev ?? new Vector3(0, 0, 1);
	const desired = new Vector3(delta2D.X, 0, delta2D.Y).Unit;
	const base = prev ?? new Vector3(0, 0, 1);
	const smoothed = base.Lerp(desired, 0.6);
	return smoothed.Magnitude > 1e-3 ? smoothed.Unit : base;
}

export function updateBotRuntimeForPosition(
	runtime: BotRuntime,
	position: Vector2,
	lastPosition: Vector2,
	moveEpsilon = 0.15,
	targetEpsilon = 0.05,
) {
	const groundY = sampleGroundYAt(position);
	const offsetStable = runtime.groundOffset ?? computeStableGroundOffset(runtime.model);
	if (runtime.groundOffset === undefined) runtime.groundOffset = offsetStable;
	const target = new Vector3(position.X, groundY + offsetStable, position.Y);

	const delta = position.sub(lastPosition);
	const isMoving = delta.Magnitude > moveEpsilon;

	if (isMoving) {
		const dir = computeDesiredLookDirection(runtime.lastLookDir, delta);
		runtime.lastLookDir = dir;
		const currentPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
		runtime.model.PivotTo(CFrame.lookAt(currentPos, currentPos.add(dir), new Vector3(0, 1, 0)));
		tweenPosition(runtime, target, WORLD_TICK * 0.95);
		setRunState(runtime, true);
		return;
	}

	const holdDir = runtime.lastLookDir ?? new Vector3(0, 0, 1);
	const curPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
	runtime.model.PivotTo(CFrame.lookAt(curPos, curPos.add(holdDir), new Vector3(0, 1, 0)));
	if (curPos.sub(target).Magnitude > targetEpsilon) {
		tweenPosition(runtime, target, WORLD_TICK * 0.95);
	} else {
		runtime.activeTween?.Cancel();
		if (runtime.posV) runtime.posV.Value = target;
		else runtime.model.PivotTo(new CFrame(target));
	}
	setRunState(runtime, false);
}

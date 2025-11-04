import { CollectionService, Players, Workspace } from "@rbxts/services";
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

export function getCharacterHalfSize(character: Model): number {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	const hrp = character.FindFirstChild("HumanoidRootPart");
	if (humanoid && hrp && hrp.IsA("BasePart")) {
		return humanoid.HipHeight;
	}
	if (hrp && hrp.IsA("BasePart")) {
		warn("No humanoid found, using HRP size");
		return hrp.Size.Y * 0.5;
	}
	warn("No humanoid or HRP found, using default size");
	return 2;
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

// Tweening is now owned by the Bot component; no tween state is kept here.

export function setRunningAnimation(model: Model) {
	const humanoid = model.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return;
	let animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		animator = new Instance("Animator");
		animator.Parent = humanoid;
	}

	const idFromAnimate = "rbxassetid://913376220";

	const run = new Instance("Animation");
	run.AnimationId = idFromAnimate;
	run.Name = "RunningAnimationx";
	run.Parent = model;

	const track = animator.LoadAnimation(run);
	track.Looped = true;
	track.Priority = Enum.AnimationPriority.Core;
	track.Play(0.1);
	return track;
}

export async function initializeBotModel(id: string): Promise<Model> {
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
	if (hrp) {
		model.PrimaryPart = hrp;
	} else {
		const first = model.FindFirstChildWhichIsA("BasePart");
		if (first) model.PrimaryPart = first;
	}
	model.Parent = Workspace;

	// Anchor primary part to fully remove physics/gravity influence; we manually tween CFrame
	const primary = model.PrimaryPart;
	if (primary) {
		primary.Anchored = true;
		primary.CanCollide = false;
		primary.AssemblyLinearVelocity = new Vector3(0, 0, 0);
		primary.AssemblyAngularVelocity = new Vector3(0, 0, 0);
	}

	const animateScript = model.FindFirstChild("Animate");
	if (animateScript && (animateScript.IsA("LocalScript") || animateScript.IsA("Script"))) {
		(animateScript as LocalScript | Script).Disabled = true;
	}

	const humanoid = model.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		humanoid.AutoRotate = false;
		humanoid.ChangeState(Enum.HumanoidStateType.RunningNoPhysics);
	}

	setRunningAnimation(model);

	return model;
}

export function cleanupBotRuntime(runtime: BotRuntime) {
	runtime.activeTween?.Cancel();
	runtime.posV?.Destroy();
	runtime.model.Destroy();
}

export function computeDesiredLookDirection(prev: Vector3 | undefined, delta2D: Vector2): Vector3 {
	if (delta2D.Magnitude <= 1e-6) return prev ?? new Vector3(0, 0, 1);
	const desired = new Vector3(delta2D.X, 0, delta2D.Y).Unit;
	const base = prev ?? new Vector3(0, 0, 1);
	const smoothed = base.Lerp(desired, 0.6);
	return smoothed.Magnitude > 1e-3 ? smoothed.Unit : base;
}

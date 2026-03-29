import { CollectionService, Players, Workspace } from "@rbxts/services";
import { findSharedInstanceByPath } from "shared/SharedModelManager";

const BOT_DEBUG = true;
function botDebug(botId: string, ...args: unknown[]) {
	if (BOT_DEBUG) print(`[Bot:${botId}]`, ...args);
}

const GROUND_TAG = "ground";

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

/**
 * Validates that a character model has the minimum required parts to function as a bot.
 */
function isValidCharacterModel(model: Model): boolean {
	const hrp = model.FindFirstChild("HumanoidRootPart");
	const humanoid = model.FindFirstChildOfClass("Humanoid");
	return hrp !== undefined && hrp.IsA("BasePart") && humanoid !== undefined;
}

export function tryCloneRandomPlayerCharacter(): Model | undefined {
	const players = Players.GetPlayers();
	if (players.size() === 0) {
		warn("[Bot] No players available to clone character from");
		return undefined;
	}

	// Shuffle players so we try different ones each time
	const random = new Random();
	const shuffled = [...players];
	for (let i = shuffled.size() - 1; i > 0; i--) {
		const j = random.NextInteger(0, i);
		const tmp = shuffled[i];
		shuffled[i] = shuffled[j];
		shuffled[j] = tmp;
	}

	for (const player of shuffled) {
		const source = player.Character;
		if (!source) {
			warn(`[Bot] Player ${player.Name} has no character loaded, skipping`);
			continue;
		}

		if (!isValidCharacterModel(source)) {
			warn(`[Bot] Player ${player.Name} character missing HRP or Humanoid, skipping`);
			continue;
		}

		const prev = source.Archivable;
		source.Archivable = true;
		const clone = source.Clone();
		source.Archivable = prev;

		if (!isValidCharacterModel(clone)) {
			warn(`[Bot] Cloned character from ${player.Name} is invalid (parts lost during clone), skipping`);
			clone.Destroy();
			continue;
		}

		return clone;
	}

	warn("[Bot] Could not clone any player character — all players either have no character or invalid models");
	return undefined;
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

	// 1) Try reusing an existing model in Workspace (e.g. from a previous lifecycle)
	const existing = Workspace.FindFirstChild(id);
	if (existing && existing.IsA("Model")) {
		botDebug(id, "Found existing model in Workspace, cloning");
		const prev = existing.Archivable;
		existing.Archivable = true;
		source = existing.Clone();
		existing.Archivable = prev;
		if (source && !isValidCharacterModel(source)) {
			warn(`[Bot:${id}] Existing model clone is invalid, discarding`);
			source.Destroy();
			source = undefined;
		}
	}

	// 2) Clone a random player character
	if (!source) {
		botDebug(id, "Trying to clone a random player character");
		source = tryCloneRandomPlayerCharacter();
		if (source) {
			botDebug(id, "Successfully cloned player character");
		}
	}

	// 3) Fallback to the Noob model with a timeout so we don't hang forever
	if (!source) {
		botDebug(id, "Falling back to Noob model from ReplicatedStorage");
		const noobPromise = findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Characters/Noob");
		const timeoutPromise = new Promise<undefined>((resolve) => {
			task.delay(10, () => resolve(undefined));
		});
		const result = await Promise.race([noobPromise.then((m) => m), timeoutPromise]);
		if (result !== undefined) {
			const prev = result.Archivable;
			result.Archivable = true;
			source = result.Clone();
			result.Archivable = prev;
			botDebug(id, "Successfully loaded Noob fallback model");
		} else {
			warn(`[Bot:${id}] Noob model load timed out after 10s`);
		}
	}

	// 4) Last resort: create a minimal placeholder model so the bot still functions
	if (!source) {
		warn(`[Bot:${id}] All character sources failed — creating minimal placeholder`);
		source = new Instance("Model");
		source.Name = id;

		const hrp = new Instance("Part");
		hrp.Name = "HumanoidRootPart";
		hrp.Size = new Vector3(2, 2, 1);
		hrp.Transparency = 0;
		hrp.Parent = source;

		const head = new Instance("Part");
		head.Name = "Head";
		head.Size = new Vector3(1.2, 1.2, 1.2);
		head.Shape = Enum.PartType.Ball;
		head.Position = new Vector3(0, 2.5, 0);
		head.Transparency = 0;
		head.Parent = source;

		const humanoid = new Instance("Humanoid");
		humanoid.Parent = source;

		source.PrimaryPart = hrp;
	}

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

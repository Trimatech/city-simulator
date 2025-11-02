import React, { useEffect, useRef } from "@rbxts/react";
import { CollectionService, Players, TweenService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { findSharedInstanceByPath } from "shared/SharedModelManager";

const GROUND_TAG = "ground";

const DEFAULT_RUN_R6 = "rbxassetid://180426354";
const DEFAULT_RUN_R15 = "rbxassetid://507767714";

function sampleGroundYAt(position: Vector2): number {
	const origin = new Vector3(position.X, 2048, position.Y);
	const direction = new Vector3(0, -8192, 0);
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = CollectionService.GetTagged(GROUND_TAG);
	const result = Workspace.Raycast(origin, direction, params);
	print(".....sampleGroundYAt", result?.Position?.Y);
	return result ? result.Position.Y : 15;
}

function getCharacterGroundOffset(character: Model): number {
	// Use half of the model's total height so the model's pivot is placed at mid-height above ground
	const [, size] = character.GetBoundingBox();
	const height = size.Y;
	if (height > 0) {
		return height * 0.5;
	}

	// Fallbacks if bounding box is unavailable for some reason
	const hrp = character.FindFirstChild("HumanoidRootPart");
	if (hrp && hrp.IsA("BasePart")) {
		return hrp.Size.Y * 0.5;
	}
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		return humanoid.HipHeight;
	}
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

function tryCloneRandomPlayerCharacter(): Model | undefined {
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

interface BotRuntime {
	readonly model: Model;
	animator?: Animator;
	runTrack?: AnimationTrack;
	posV?: Vector3Value;
	activeTween?: Tween;
	lastLookDir?: Vector3;
}

export interface BotProps {
	readonly id: string;
	readonly soldier: {
		readonly position: Vector2;
	};
}

function tweenPosition(runtime: BotRuntime, target: Vector3, duration = WORLD_TICK) {
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

function ensureRun(runtime: BotRuntime) {
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

export function Bot({ id, soldier }: BotProps) {
	const runtimeRef = useRef<BotRuntime>();
	const lastPosRef = useRef<Vector2>(soldier.position);

	useEffect(() => {
		(async () => {
			let source: Model | undefined;
			const existing = Workspace.FindFirstChild(id);
			if (existing && existing.IsA("Model")) {
				const prev = existing.Archivable;
				existing.Archivable = true;
				source = existing.Clone();
				existing.Archivable = prev;
			}
			if (!source) source = tryCloneRandomPlayerCharacter();
			if (!source)
				source = (await findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Characters/Noob")).Clone();

			const model = source!;
			model.Name = id;
			model.GetDescendants().forEach((inst) => {
				if (inst.IsA("BasePart")) {
					inst.Anchored = false; // allow animations to affect Motor6D joints
					inst.CanCollide = false; // avoid physical interactions; we drive via PivotTo
				}
			});
			const hrp = model.FindFirstChild("HumanoidRootPart") as BasePart;
			if (hrp) model.PrimaryPart = hrp;
			else {
				const first = model.FindFirstChildWhichIsA("BasePart");
				if (first) model.PrimaryPart = first;
			}
			model.Parent = Workspace;

			// Disable default Animate script to avoid overriding our run track, but keep its Animation children
			const animateScript = model.FindFirstChild("Animate");
			if (animateScript && (animateScript.IsA("LocalScript") || animateScript.IsA("Script"))) {
				(animateScript as LocalScript | Script).Disabled = true;
			}

			// configure humanoid for CFrame-driven movement with animations
			const humanoid = model.FindFirstChildOfClass("Humanoid");
			if (humanoid) {
				humanoid.AutoRotate = false;
				// ensures animation plays while physics is not simulated
				humanoid.ChangeState(Enum.HumanoidStateType.RunningNoPhysics);
			}

			const groundY = sampleGroundYAt(soldier.position);
			const offset = getCharacterGroundOffset(model);
			const start = new Vector3(soldier.position.X, groundY + offset, soldier.position.Y);
			model.PivotTo(new CFrame(start));

			const posV = new Instance("Vector3Value");
			posV.Value = start;
			posV.Changed.Connect((newPos) => {
				const pos = newPos as Vector3;
				const dir = runtimeRef.current?.lastLookDir ?? new Vector3(0, 0, 1);
				runtimeRef.current?.model.PivotTo(CFrame.lookAt(pos, pos.add(dir), new Vector3(0, 1, 0)));
			});

			runtimeRef.current = { model, posV, lastLookDir: new Vector3(0, 0, 1) };
			// ensure and start running animation immediately if possible
			const runtimeNow = runtimeRef.current;
			if (runtimeNow) {
				ensureRun(runtimeNow);
				runtimeNow.runTrack?.AdjustSpeed(1);
				if (runtimeNow.runTrack && runtimeNow.runTrack.IsPlaying === false) runtimeNow.runTrack.Play(0.1);
			}
		})();

		return () => {
			const runtime = runtimeRef.current;
			if (!runtime) return;
			runtime.activeTween?.Cancel();
			runtime.posV?.Destroy();
			runtime.model.Destroy();
			runtimeRef.current = undefined;
		};
	}, []);

	useEffect(() => {
		const runtime = runtimeRef.current;
		if (!runtime) return;
		const position = soldier.position;
		const groundY = sampleGroundYAt(position);
		const offset = getCharacterGroundOffset(runtime.model);
		const to = new Vector3(position.X, groundY + offset, position.Y);

		const last = lastPosRef.current;
		const delta = position.sub(last);
		const moving = delta.Magnitude > 1e-3;

		if (moving) {
			const raw = delta.div(delta.Magnitude);
			const desired = new Vector3(raw.X, 0, raw.Y);
			const prev = runtime.lastLookDir ?? new Vector3(0, 0, 1);
			const smoothed = prev.Lerp(desired, 0.6);
			const dir = smoothed.Magnitude > 1e-3 ? smoothed.Unit : prev;
			runtime.lastLookDir = dir;
			const curPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
			runtime.model.PivotTo(CFrame.lookAt(curPos, curPos.add(dir), new Vector3(0, 1, 0)));
			// compensate network drift by tweening slightly ahead of tick to reduce visible stutter
			tweenPosition(runtime, to, WORLD_TICK * 0.95);
			ensureRun(runtime);
			runtime.runTrack?.AdjustSpeed(1);
			if (runtime.runTrack && runtime.runTrack.IsPlaying === false) runtime.runTrack.Play(0.1);
		} else {
			const holdDir = runtime.lastLookDir ?? new Vector3(0, 0, 1);
			const curPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
			runtime.model.PivotTo(CFrame.lookAt(curPos, curPos.add(holdDir), new Vector3(0, 1, 0)));
			// use slightly shorter tween to align with next update
			tweenPosition(runtime, to, WORLD_TICK * 0.95);
			// keep running animation always playing
			ensureRun(runtime);
			runtime.runTrack?.AdjustSpeed(1);
			if (runtime.runTrack && runtime.runTrack.IsPlaying === false) runtime.runTrack.Play(0.1);
		}

		lastPosRef.current = position;
	}, [soldier]);

	return <></>;
}

import Object from "@rbxts/object-utils";
import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { CollectionService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { findSharedInstanceByPath } from "shared/SharedModelManager";
import { selectSoldiersById } from "shared/store/soldiers";

const GROUND_TAG = "ground";

function sampleGroundYAt(position: Vector2): number {
	const origin = new Vector3(position.X, 2048, position.Y);
	const direction = new Vector3(0, -8192, 0);
	const params = new RaycastParams();
	params.FilterType = Enum.RaycastFilterType.Include;
	params.FilterDescendantsInstances = CollectionService.GetTagged(GROUND_TAG);
	const result = Workspace.Raycast(origin, direction, params);
	return result ? result.Position.Y : 2;
}

function getCharacterGroundOffset(character: Model): number {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	const hrp = character.FindFirstChild("HumanoidRootPart");
	let offset = 2;
	if (humanoid) offset = humanoid.HipHeight;
	if (hrp && hrp.IsA("BasePart")) offset += hrp.Size.Y * 0.5;
	return offset;
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

interface BotRuntime {
	readonly model: Model;
	animator?: Animator;
	runTrack?: AnimationTrack;
	lastPosition: Vector2;
}

export function Bots() {
	const soldiersById = useSelector(selectSoldiersById);
	const botsById = useMemo(() => {
		const result: { [id: string]: true } = {};
		for (const [rawId] of Object.entries(soldiersById)) {
			const id = tostring(rawId);
			if (string.sub(id, 1, 4) === "BOT_") result[id] = true;
		}
		return result;
	}, [soldiersById]);

	const runtime = useRef(new Map<string, BotRuntime>());

	useEffect(() => {
		for (const [id] of runtime.current) {
			if (!(id in botsById)) {
				const entry = runtime.current.get(id)!;
				entry.model.Destroy();
				runtime.current.delete(id);
			}
		}
		for (const rawId of Object.keys(botsById)) {
			const id = tostring(rawId);
			if (!runtime.current.has(id)) {
				// Create a client-only visual clone (ensure movable primary part)
				(async () => {
					const base = await findSharedInstanceByPath<Model>("ReplicatedStorage/Models/Gameplay/Tower");
					const model = base.Clone();
					model.Name = id;
					// Ensure parts are anchored and non-colliding for tweened visuals
					model.GetDescendants().forEach((inst) => {
						if (inst.IsA("BasePart")) {
							inst.Anchored = true;
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
					// Place at current soldier position immediately
					const soldier = soldiersById[id];
					if (soldier && model.PrimaryPart) {
						const groundY = sampleGroundYAt(soldier.position);
						const offset = getCharacterGroundOffset(model);
						const from = new Vector3(soldier.position.X, groundY + offset, soldier.position.Y);
						model.PivotTo(new CFrame(from));
					}
					runtime.current.set(id, { model, lastPosition: soldier ? soldier.position : new Vector2() });
				})();
			}
		}
		return () => {
			for (const [, entry] of runtime.current) entry.model.Destroy();
			runtime.current.clear();
		};
	}, [botsById]);

	useInterval(() => {
		for (const [id, entry] of runtime.current) {
			const soldier = soldiersById[id];
			if (!soldier) continue;
			const position = soldier.position;

			const groundY = sampleGroundYAt(position);
			const offset = getCharacterGroundOffset(entry.model);
			// const from = entry.model.GetPrimaryPartCFrame().Position;
			const to = new Vector3(position.X, groundY + offset, position.Y);

			const delta = position.sub(entry.lastPosition);
			const moving = delta.Magnitude > 0.01;

			if (moving) {
				const dir = delta.div(delta.Magnitude);
				const look = new CFrame(to, to.add(new Vector3(dir.X, 0, dir.Y)));
				tweenPivot(entry.model, look);
				ensureRun(entry);
				entry.runTrack?.AdjustSpeed(math.max(0.1, 1));
				if (entry.runTrack && entry.runTrack.IsPlaying === false) entry.runTrack.Play(0.1);
			} else {
				tweenPivot(entry.model, new CFrame(to));
				if (entry.runTrack && entry.runTrack.IsPlaying) entry.runTrack.Stop(0.2);
			}

			entry.lastPosition = position;
		}
	}, WORLD_TICK);

	return <></>;
}

function tweenPivot(model: Model, target: CFrame) {
	const current = model.GetPivot();
	const lerped = current.Lerp(target, 0.5);
	model.PivotTo(lerped);
}

function ensureRun(entry: BotRuntime) {
	if (entry.runTrack && entry.animator) return;
	const humanoid = entry.model.FindFirstChildOfClass("Humanoid");
	if (!humanoid) return;
	let animator = humanoid.FindFirstChildOfClass("Animator");
	if (!animator) {
		animator = new Instance("Animator");
		animator.Parent = humanoid;
	}
	// Use any run animation available under the model
	const run = findRunAnimation(entry.model);
	if (!run) return;
	entry.runTrack = animator.LoadAnimation(run);
	entry.animator = animator;
}

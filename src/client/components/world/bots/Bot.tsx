import React, { useEffect, useRef } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { findSharedInstanceByPath } from "shared/SharedModelManager";

import {
	BotRuntime,
	computeStableGroundOffset,
	ensureRun,
	sampleGroundYAt,
	setRunState,
	tryCloneRandomPlayerCharacter,
	tweenPosition,
} from "./Bot.utils";

interface BotProps {
	readonly id: string;
	readonly soldier: {
		readonly position: Vector2;
	};
}

export function Bot({ id, soldier }: BotProps) {
	const runtimeRef = useRef<BotRuntime>();
	const lastPosRef = useRef<Vector2>(soldier.position);

	// Movement thresholds to avoid perpetual minor motion
	const MOVE_EPSILON = 0.15;
	const TARGET_EPSILON = 0.05;

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
			const offset = computeStableGroundOffset(model);
			const start = new Vector3(soldier.position.X, groundY + offset, soldier.position.Y);
			model.PivotTo(new CFrame(start));

			const posV = new Instance("Vector3Value");
			posV.Value = start;
			posV.Changed.Connect((newPos) => {
				const pos = newPos as Vector3;
				const dir = runtimeRef.current?.lastLookDir ?? new Vector3(0, 0, 1);
				runtimeRef.current?.model.PivotTo(CFrame.lookAt(pos, pos.add(dir), new Vector3(0, 1, 0)));
			});

			runtimeRef.current = { model, posV, lastLookDir: new Vector3(0, 0, 1), groundOffset: offset };
			// prepare running animation track but do not auto-play
			const runtimeNow = runtimeRef.current;
			if (runtimeNow) {
				ensureRun(runtimeNow);
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
		const offsetStable = runtime.groundOffset ?? computeStableGroundOffset(runtime.model);
		if (runtime.groundOffset === undefined) runtime.groundOffset = offsetStable;
		const to = new Vector3(position.X, groundY + offsetStable, position.Y);

		const last = lastPosRef.current;
		const delta = position.sub(last);
		const moving = delta.Magnitude > MOVE_EPSILON;

		if (moving) {
			const raw = delta.div(delta.Magnitude);
			const desired = new Vector3(raw.X, 0, raw.Y);
			const prev = runtime.lastLookDir ?? new Vector3(0, 0, 1);
			const smoothed = prev.Lerp(desired, 0.6);
			const dir = smoothed.Magnitude > 1e-3 ? smoothed.Unit : prev;
			runtime.lastLookDir = dir;
			const curPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
			runtime.model.PivotTo(CFrame.lookAt(curPos, curPos.add(dir), new Vector3(0, 1, 0)));
			// Tween towards target slightly ahead of tick to reduce visible stutter
			tweenPosition(runtime, to, WORLD_TICK * 0.95);
			setRunState(runtime, true);
		} else {
			const holdDir = runtime.lastLookDir ?? new Vector3(0, 0, 1);
			const curPos = runtime.posV?.Value ?? runtime.model.GetPivot().Position;
			runtime.model.PivotTo(CFrame.lookAt(curPos, curPos.add(holdDir), new Vector3(0, 1, 0)));
			// Only tween if we're meaningfully away from the target to avoid micro-motion
			if (curPos.sub(to).Magnitude > TARGET_EPSILON) {
				tweenPosition(runtime, to, WORLD_TICK * 0.95);
			} else {
				// Close enough; snap and stop tween
				runtime.activeTween?.Cancel();
				if (runtime.posV) runtime.posV.Value = to;
				else runtime.model.PivotTo(new CFrame(to));
			}
			// stop run while idle
			setRunState(runtime, false);
		}

		lastPosRef.current = position;
	}, [soldier]);

	return <></>;
}

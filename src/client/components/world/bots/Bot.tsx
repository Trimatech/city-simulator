import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { selectSoldierById, selectSoldierPosition } from "shared/store/soldiers";
import { RAGDOLL_DURATION_SEC } from "shared/utils/ragdoll";
import { NAME_DISPLAY_DISTANCE } from "../glow/label-constants";

import { SoldierGlow } from "../glow/SoldierGlow";
import { computeDesiredLookDirection, getCharacterHalfSize, initializeBotModel, sampleGroundYAt } from "./Bot.utils";

interface BotProps {
	readonly id: string;
}

export function Bot({ id }: BotProps) {
	const position = useSelector(selectSoldierPosition(id));
	const soldier = useSelector(selectSoldierById(id));
	const modelRef = useRef<Model>();
	const [model, setModel] = useState<Model>();
	const lastPosRef = useRef<Vector2>(position);
	const groundYOffset = useRef<number>(0);
	const halfSize = useRef<number>(0);
	const tweenRef = useRef<Tween>();
	const lastLookDirRef = useRef<Vector3>();

	useEffect(() => {
		let cancelled = false;

		const tryInit = async (attempt: number) => {
			if (cancelled) return;
			try {
				const m = await initializeBotModel(id);
				if (cancelled) {
					m.Destroy();
					return;
				}
				// Set bot display name and increase label visibility distance
				const humanoid = m.FindFirstChildOfClass("Humanoid");
				if (humanoid) {
					humanoid.DisplayName = soldier?.name ?? id;
					humanoid.NameDisplayDistance = NAME_DISPLAY_DISTANCE;
				}
				halfSize.current = getCharacterHalfSize(m);
				modelRef.current = m;
				setModel(m);
			} catch (err) {
				warn(`[Bot:${id}] initializeBotModel failed (attempt ${attempt}):`, err);
				if (!cancelled && attempt < 3) {
					task.delay(2, () => tryInit(attempt + 1));
				} else {
					warn(`[Bot:${id}] Giving up after ${attempt} attempts`);
				}
			}
		};

		tryInit(1);

		return () => {
			cancelled = true;
			tweenRef.current?.Cancel();
			setModel(undefined);
			const model = modelRef.current;
			if (model) {
				const humanoid = model.FindFirstChildOfClass("Humanoid");
				if (humanoid) {
					humanoid.ChangeState(Enum.HumanoidStateType.Physics);
				}
				// Stop all animations
				const animator = humanoid?.FindFirstChildOfClass("Animator");
				if (animator) {
					animator.GetPlayingAnimationTracks().forEach((track) => track.Stop());
				}
				// Unanchor all parts, enable collision, and destroy Motor6D joints for ragdoll
				const random = new Random();
				model.GetDescendants().forEach((inst) => {
					if (inst.IsA("BasePart")) {
						inst.Anchored = false;
						inst.CanCollide = true;
						// Apply random force to each part
						inst.AssemblyLinearVelocity = new Vector3(
							random.NextNumber(-30, 30),
							random.NextNumber(20, 60),
							random.NextNumber(-30, 30),
						);
					}
					if (inst.IsA("Motor6D")) {
						inst.Destroy();
					}
				});
				task.delay(RAGDOLL_DURATION_SEC, () => {
					if (model.Parent) {
						model.Destroy();
					}
				});
			}
		};
	}, []);

	// Keep for future use if we want periodic rebasing; currently we recompute per position update
	useEffect(() => {
		let acc = 0;
		const conn = RunService.Heartbeat.Connect((dt) => {
			acc += dt;
			if (acc < 1) return;
			acc = 0;

			if (!modelRef.current) return;

			if (!lastPosRef.current) return;

			groundYOffset.current = sampleGroundYAt(lastPosRef.current);
		});

		return () => conn.Disconnect();
	}, []);

	useEffect(() => {
		if (!position) return;

		const model = modelRef.current;
		if (!model) return;

		const playTween = (targetCf: CFrame, duration: number) => {
			const part = model.PrimaryPart;
			if (!part) {
				const children = model
					.GetChildren()
					.map((c) => c.Name)
					.join(", ");
				warn(`[Bot:${id}] No primary part found — model children: ${children}`);
				return;
			}

			if (part.CFrame.Position.sub(targetCf.Position).Magnitude <= 1e-4) {
				return;
			}

			tweenRef.current?.Cancel();
			const tween = TweenService.Create(
				part,
				new TweenInfo(duration, Enum.EasingStyle.Linear, Enum.EasingDirection.In),
				{ CFrame: targetCf },
			);

			tweenRef.current = tween;
			tween.Completed.Once(() => {
				if (tweenRef.current === tween) {
					tweenRef.current = undefined;
				}
			});

			tween.Play();
		};

		const targetPos = new Vector3(position.X, groundYOffset.current + halfSize.current, position.Y);

		const delta = position.sub(lastPosRef.current);

		const dir = computeDesiredLookDirection(lastLookDirRef.current, delta);
		lastLookDirRef.current = dir;
		// Build a target CFrame that faces the movement direction while keeping Y fixed
		const targetCf = CFrame.lookAt(targetPos, targetPos.add(dir), new Vector3(0, 1, 0));
		playTween(targetCf, WORLD_TICK * 0.95);

		lastPosRef.current = position;
	}, [position]);

	// Toggle ForceField on bot character when shield is active
	useEffect(() => {
		const m = modelRef.current;
		if (!m) return;

		const hasShield = soldier !== undefined && soldier.shieldActiveUntil > Workspace.GetServerTimeNow();

		if (hasShield) {
			if (!m.FindFirstChildOfClass("ForceField")) {
				const ff = new Instance("ForceField");
				ff.Visible = true;
				ff.Parent = m;
			}
		} else {
			const ff = m.FindFirstChildOfClass("ForceField");
			if (ff) ff.Destroy();
		}
	}, [soldier?.shieldActiveUntil, model]);

	return <SoldierGlow id={id} model={model} />;
}

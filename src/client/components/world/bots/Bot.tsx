import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { selectSoldierById, selectSoldierPosition } from "shared/store/soldiers";
import { RAGDOLL_DURATION_SEC, ragdollCharacter } from "shared/utils/ragdoll";

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
				warn("[Bot] initializeBotModel failed", { id, attempt, err });
				if (!cancelled && attempt < 3) {
					task.delay(2, () => tryInit(attempt + 1));
				} else {
					warn("[Bot] Giving up after max attempts", { id, attempt });
				}
			}
		};

		tryInit(1);

		return () => {
			cancelled = true;
			tweenRef.current?.Cancel();
			tweenRef.current = undefined;
			const model = modelRef.current;
			modelRef.current = undefined;
			setModel(undefined);
			if (model) {
				// Rename so a respawning bot won't find and clone this ragdolled model
				model.Name = `${model.Name}_ragdoll`;
				const destroyRagdoll = ragdollCharacter(model, 30);
				task.delay(RAGDOLL_DURATION_SEC, destroyRagdoll);
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
				warn("[Bot] No primary part found", { id, children });
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

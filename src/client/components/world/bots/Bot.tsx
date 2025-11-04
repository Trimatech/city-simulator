import React, { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService, TweenService } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { selectSoldierPosition } from "shared/store/soldiers";

import { computeDesiredLookDirection, getCharacterHalfSize, initializeBotModel, sampleGroundYAt } from "./Bot.utils";

interface BotProps {
	readonly id: string;
}

export function Bot({ id }: BotProps) {
	const position = useSelector(selectSoldierPosition(id));
	const modelRef = useRef<Model>();
	const lastPosRef = useRef<Vector2>(position);
	const groundYOffset = useRef<number>(0);
	const halfSize = useRef<number>(0);
	const tweenRef = useRef<Tween>();
	const lastLookDirRef = useRef<Vector3>();

	useEffect(() => {
		(async () => {
			const model = await initializeBotModel(id);
			halfSize.current = getCharacterHalfSize(model);
			modelRef.current = model;
		})();

		return () => {
			tweenRef.current?.Cancel();
			modelRef.current?.Destroy();
		};
	}, []);

	// Keep for future use if we want periodic rebasing; currently we recompute per position update
	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {});
		return () => conn.Disconnect();
	}, []);

	useEffect(() => {
		if (!position) return;

		const model = modelRef.current;
		if (!model) return;

		const playTween = (targetCf: CFrame, duration: number) => {
			const part = model.PrimaryPart;
			if (!part) {
				warn("No primary part found");
				return;
			}

			if (part.CFrame.Position.sub(targetCf.Position).Magnitude <= 1e-4) {
				warn("Position is already at target");
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

		// Ground-lock Y at the current 2D position
		const groundY = sampleGroundYAt(position);
		groundYOffset.current = groundY;
		const targetPos = new Vector3(position.X, groundY + halfSize.current, position.Y);

		const delta = position.sub(lastPosRef.current);

		const dir = computeDesiredLookDirection(lastLookDirRef.current, delta);
		lastLookDirRef.current = dir;
		// Build a target CFrame that faces the movement direction while keeping Y fixed
		const targetCf = CFrame.lookAt(targetPos, targetPos.add(dir), new Vector3(0, 1, 0));
		playTween(targetCf, WORLD_TICK * 0.95);

		lastPosRef.current = position;
	}, [position]);

	return <></>;
}

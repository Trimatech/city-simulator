import React, { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService, TweenService } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { selectSoldierPosition } from "shared/store/soldiers";

import {
	computeDesiredLookDirection,
	getCharacterHalfSize,
	initializeBotModel,
	sampleGroundYAt,
	setRunState,
} from "./Bot.utils";

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

			setRunState(model, true);
		})();

		return () => {
			tweenRef.current?.Cancel();
			modelRef.current?.Destroy();
		};
	}, []);

	// Recompute ground offset at 1Hz and apply Y adjustment even if position is unchanged
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

		const playTween = (target: Vector3, duration: number) => {
			const part = model.PrimaryPart;
			if (!part) {
				warn("No primary part found");
				return;
			}

			if (part.Position.sub(target).Magnitude <= 1e-4) {
				warn("Position is already at target");
				return;
			}

			tweenRef.current?.Cancel();
			const tween = TweenService.Create(
				part,
				new TweenInfo(duration, Enum.EasingStyle.Linear, Enum.EasingDirection.In),
				{ Position: target },
			);

			tweenRef.current = tween;
			tween.Completed.Once(() => {
				if (tweenRef.current === tween) {
					tweenRef.current = undefined;
				}
			});

			tween.Play();
		};

		const target = new Vector3(position.X, groundYOffset.current + halfSize.current, position.Y);

		print(`target=${target}`);
		const delta = position.sub(lastPosRef.current);

		const dir = computeDesiredLookDirection(lastLookDirRef.current, delta);
		lastLookDirRef.current = dir;
		//	const currentPos = model.GetPivot().Position;
		//	model.PivotTo(CFrame.lookAt(currentPos, currentPos.add(dir), new Vector3(0, 1, 0)));
		playTween(target, WORLD_TICK * 0.95);

		lastPosRef.current = position;
	}, [position]);

	return <></>;
}

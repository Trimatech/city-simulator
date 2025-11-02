import React, { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectSoldierPosition } from "shared/store/soldiers";

import { BotRuntime, cleanupBotRuntime, initializeBotRuntime, updateBotRuntimeForPosition } from "./Bot.utils";

interface BotProps {
	readonly id: string;
}

export function Bot({ id }: BotProps) {
	const position = useSelector(selectSoldierPosition(id));
	const runtimeRef = useRef<BotRuntime>();
	const lastPosRef = useRef<Vector2>(position);

	// Movement thresholds to avoid perpetual minor motion
	const MOVE_EPSILON = 0.15;
	const TARGET_EPSILON = 0.05;

	useEffect(() => {
		(async () => {
			const runtime = await initializeBotRuntime(id, position);
			runtimeRef.current = runtime;
		})();

		return () => {
			const runtime = runtimeRef.current;
			if (runtime) cleanupBotRuntime(runtime);
			runtimeRef.current = undefined;
		};
	}, []);

	useEffect(() => {
		if (!position) return;
		const runtime = runtimeRef.current;
		if (!runtime) return;
		updateBotRuntimeForPosition(runtime, position, lastPosRef.current, MOVE_EPSILON, TARGET_EPSILON);
		lastPosRef.current = position;
	}, [position]);

	return <></>;
}

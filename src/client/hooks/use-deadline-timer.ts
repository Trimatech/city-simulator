import { useEventListener } from "@rbxts/pretty-react-hooks";
import { useBinding, useEffect, useRef } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";

export interface DeadlineTimerResult {
	/** 0-1 binding representing how much time is left (1 = full, 0 = expired) */
	progress: React.Binding<number>;
	/** Binding of remaining whole seconds as a string */
	secondsLeft: React.Binding<string>;
}

export function useDeadlineTimer(
	deadlineTime: number,
	totalDuration: number,
	onExpired?: () => void,
): DeadlineTimerResult {
	const [progress, setProgress] = useBinding(
		math.clamp((deadlineTime - Workspace.GetServerTimeNow()) / totalDuration, 0, 1),
	);
	const [secondsLeft, setSecondsLeft] = useBinding(
		`${math.ceil(math.max(0, deadlineTime - Workspace.GetServerTimeNow()))}`,
	);
	const expiredRef = useRef(false);

	useEffect(() => {
		expiredRef.current = false;
	}, [deadlineTime]);

	useEventListener(RunService.Heartbeat, () => {
		const remaining = math.max(0, deadlineTime - Workspace.GetServerTimeNow());
		setProgress(math.clamp(remaining / totalDuration, 0, 1));
		setSecondsLeft(`${math.ceil(remaining)}`);

		if (remaining <= 0 && !expiredRef.current) {
			expiredRef.current = true;
			onExpired?.();
		}
	});

	return { progress, secondsLeft };
}

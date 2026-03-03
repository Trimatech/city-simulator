import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useBinding, useEffect, useRef } from "@rbxts/react";
import { RunService } from "@rbxts/services";

import { ProgressBar } from "./ProgressBar";

export interface ProgressBarTimerProps {
	/** Absolute deadline time (from tick()) */
	deadlineTime: number;
	/** Total duration in seconds (used to compute 0-1 progress) */
	totalDuration: number;
	/** Height in pixels */
	height?: number;
	/** Called once when the timer reaches 0 */
	onExpired?: () => void;
	/** Render prop receiving a binding of the remaining whole seconds as text */
	renderOverlay?: (secondsLeft: React.Binding<string>) => React.ReactNode;
}

export function ProgressBarTimer({
	deadlineTime,
	totalDuration,
	height,
	onExpired,
	renderOverlay,
}: ProgressBarTimerProps) {
	const [progress, setProgress] = useBinding(math.clamp((deadlineTime - tick()) / totalDuration, 0, 1));
	const [secondsLeft, setSecondsLeft] = useBinding(`${math.ceil(math.max(0, deadlineTime - tick()))}`);
	const expiredRef = useRef(false);

	useEffect(() => {
		expiredRef.current = false;
	}, [deadlineTime]);

	useEventListener(RunService.Heartbeat, () => {
		const remaining = math.max(0, deadlineTime - tick());
		setProgress(math.clamp(remaining / totalDuration, 0, 1));
		setSecondsLeft(`${math.ceil(remaining)}`);

		if (remaining <= 0 && !expiredRef.current) {
			expiredRef.current = true;
			onExpired?.();
		}
	});

	return (
		<>
			<ProgressBar progress={progress} height={height} />
			{renderOverlay?.(secondsLeft)}
		</>
	);
}

import React from "@rbxts/react";
import { useDeadlineTimer } from "client/hooks/use-deadline-timer";

import { ProgressBar } from "./ProgressBar";

export interface ProgressBarTimerProps {
	/** Absolute deadline time (from Workspace.GetServerTimeNow()) */
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
	const { progress, secondsLeft } = useDeadlineTimer(deadlineTime, totalDuration, onExpired);

	return (
		<>
			<ProgressBar progress={progress} height={height} />
			{renderOverlay?.(secondsLeft)}
		</>
	);
}

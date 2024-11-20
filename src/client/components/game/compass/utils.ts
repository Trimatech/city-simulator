import { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { setTimeout } from "@rbxts/set-timeout";
import { selectTopSoldier } from "shared/store/soldiers";

/**
 * Returns the current leader's state. If the ID changed, this value
 * will be debounced to prevent jitter and excess updates.
 */
export function useLeader() {
	const currentLeader = useSelector(selectTopSoldier);
	const [leader, setLeader] = useState(currentLeader);

	useEffect(() => {
		if (currentLeader?.id === leader?.id) {
			setLeader(currentLeader);
		}
	}, [currentLeader]);

	useEffect(() => {
		if (currentLeader?.id !== leader?.id) {
			return setTimeout(() => setLeader(currentLeader), 0.5);
		}
	}, [currentLeader?.id]);

	return leader;
}

import { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { setTimeout } from "@rbxts/set-timeout";
import { selectTopSoldier } from "shared/store/soldiers";

/**
 * Returns the current leader's state. If the ID changed, this value
 * will be debounced to prevent jitter and excess updates.
 */
export function useLeaderPosition() {
	const currentLeader = useSelector(selectTopSoldier);
	const selected = currentLeader ? { id: currentLeader.id, position: currentLeader.position } : undefined;
	const [leader, setLeader] = useState(selected);

	// Immediate updates when the leader is the same, but position changes
	useEffect(() => {
		if (!selected) {
			return;
		}

		if (!leader) {
			setLeader(selected);
			return;
		}

		if (selected.id === leader.id && selected.position !== leader.position) {
			setLeader(selected);
		}
	}, [selected?.position]);

	// Debounce when the leader id changes to prevent jitter
	useEffect(() => {
		if (selected?.id !== leader?.id) {
			return setTimeout(() => setLeader(selected), 0.5);
		}
	}, [selected?.id]);

	return leader?.position;
}

import { useEffect, useMemo, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { setTimeout } from "@rbxts/set-timeout";
import { USER_NAME } from "shared/constants/core";
import { resolveTopSoldierEntity, selectSoldiersById } from "shared/store/soldiers";

/**
 * Returns the current leader's state. If the ID changed, this value
 * will be debounced to prevent jitter and excess updates.
 * Returns undefined if the local player is the leader.
 */
export function useLeaderPosition() {
	const allSoldiers = useSelector(selectSoldiersById);
	const currentLeader = useMemo(() => resolveTopSoldierEntity(allSoldiers), [allSoldiers]);
	const isLocalLeader = currentLeader?.id === USER_NAME;
	const selected =
		currentLeader && !isLocalLeader ? { id: currentLeader.id, position: currentLeader.position } : undefined;
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

	// const soldierEntries: string[] = [];
	// for (const [id, soldier] of pairs(allSoldiers)) {
	// 	if (soldier !== undefined) {
	// 		soldierEntries.push(`${id}:area=${soldier.polygonAreaSize},dead=${soldier.dead}`);
	// 	}
	// }
	// warn(`[COMPASS_DEBUG] allSoldiers: [${soldierEntries.join(", ")}]`);
	// warn(
	// 	`[COMPASS_DEBUG] currentLeader: ${currentLeader?.id ?? "none"}, isLocalLeader: ${isLocalLeader}, selected: ${selected?.id ?? "none"}, leader: ${leader?.id ?? "none"}, leaderPos: ${leader?.position ?? "none"}`,
	// );

	return leader?.position;
}

/**
 * Project the leader's world position (Vector2 = X,Z) to a screen-space
 * direction from the center, clamped to the screen edges.
 *
 * Uses Camera.WorldToScreenPoint so all camera transforms are handled by the engine.
 */
export function getScreenDirection(
	leaderWorldPos: Vector2,
): { screenX: number; screenY: number; angle: number } | undefined {
	const camera = Workspace.CurrentCamera;
	if (!camera) return undefined;

	// Leader world pos is (X, Z) — use Y=0 to project onto the ground plane
	const worldPos = new Vector3(leaderWorldPos.X, 0, leaderWorldPos.Y);
	const [screenPos] = camera.WorldToScreenPoint(worldPos);
	const viewportSize = camera.ViewportSize;

	// Screen-space offset from center (pixels)
	// When the point is behind the camera (Z < 0), WorldToScreenPoint mirrors the
	// coordinates — flip them so the indicator points in the correct direction.
	const behind = screenPos.Z < 0;
	const cx = (screenPos.X - viewportSize.X / 2) * (behind ? -1 : 1);
	const cy = (screenPos.Y - viewportSize.Y / 2) * (behind ? -1 : 1);

	// Angle for the arrow: 0° = up, clockwise positive
	const angle = math.deg(math.atan2(cx, -cy));

	// Normalize and clamp to screen edges with padding
	const mag = math.sqrt(cx * cx + cy * cy);
	if (mag === 0) return undefined;
	const dirX = cx / mag;
	const dirY = cy / mag;

	// Scale so the largest axis component reaches the edge (0.5 in scale terms)
	const edgeScale = math.min(0.5 / math.max(math.abs(dirX), 0.001), 0.5 / math.max(math.abs(dirY), 0.001));

	return {
		screenX: math.clamp(dirX * edgeScale + 0.5, 0, 1),
		screenY: math.clamp(dirY * edgeScale + 0.5, 0, 1),
		angle,
	};
}

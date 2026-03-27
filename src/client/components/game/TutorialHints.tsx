import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { USER_NAME } from "shared/constants/core";
import { selectPlayerLifetimeGamesPlayed, selectPlayerLifetimeOrbsSpent } from "shared/store/saves/save-selectors";
import { selectLocalPolygonAreaSize, selectLocalSoldier } from "shared/store/soldiers";

import { TutorialHint } from "./TutorialHint";

const SHOW_DELAY_SECONDS = 2;
const ORBS_HINT_DELAY_SECONDS = 3;
const MAX_GAMES_FOR_HINTS = 3;

const HINT_AREA =
	"Welcome to Zone Wars! Here's how to expand your territory:\n\n• Go <b>outside</b> your zone.\n• A <b>wall</b> trails behind you as you move.\n• <b>Loop back</b> to claim the enclosed land.\n• <font color='#ffea00'>Danger:</font> enemies can hit your <b>trail wall</b> before you return";
const HINT_ORBS =
	"You've got <b>orbs</b>! Spend them on <b>abilities</b> using the buttons on the right: Shields, turbo, laser and more";

type HintId = "area" | "orbs";

export function TutorialHints() {
	const gamesPlayed = useSelectorCreator(selectPlayerLifetimeGamesPlayed, USER_NAME);
	const orbsSpent = useSelectorCreator(selectPlayerLifetimeOrbsSpent, USER_NAME);
	const soldier = useSelector(selectLocalSoldier);

	const areaSize = useSelector(selectLocalPolygonAreaSize);

	const dismissedRef = useRef<Record<HintId, boolean>>({ area: false, orbs: false });
	const initialAreaRef = useRef<number | undefined>(undefined);
	const [activeHint, setActiveHint] = useState<HintId | undefined>(undefined);

	const isNewPlayer = gamesPlayed < MAX_GAMES_FOR_HINTS;
	const isAlive = soldier !== undefined && !soldier.dead;
	const hasOrbs = (soldier?.orbs ?? 0) > 0;
	const hasSpentOrbs = orbsSpent > 0;

	// Capture the initial area size when the soldier spawns
	useEffect(() => {
		if (isAlive && areaSize !== undefined && initialAreaRef.current === undefined) {
			initialAreaRef.current = areaSize;
		}
		if (!isAlive) {
			initialAreaRef.current = undefined;
		}
	}, [isAlive, areaSize]);

	const hasClaimedLand =
		areaSize !== undefined && initialAreaRef.current !== undefined && areaSize > initialAreaRef.current;

	// Tip 1: Show area claiming hint after a delay when spawned
	useEffect(() => {
		if (!isNewPlayer || !isAlive || dismissedRef.current.area) return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= SHOW_DELAY_SECONDS) {
				setActiveHint("area");
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isNewPlayer, isAlive]);

	// Auto-dismiss area hint when player claims new land
	useEffect(() => {
		if (activeHint === "area" && hasClaimedLand) {
			dismissedRef.current.area = true;
			setActiveHint(undefined);
		}
	}, [activeHint, hasClaimedLand]);

	// Tip 2: Show orbs hint after player has claimed land and has orbs
	useEffect(() => {
		if (!isNewPlayer || !isAlive || dismissedRef.current.orbs || !hasClaimedLand || !hasOrbs || hasSpentOrbs)
			return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= ORBS_HINT_DELAY_SECONDS) {
				setActiveHint("orbs");
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isNewPlayer, isAlive, hasOrbs, hasSpentOrbs, hasClaimedLand]);

	// Auto-dismiss orbs hint when player spends orbs
	useEffect(() => {
		if (activeHint === "orbs" && hasSpentOrbs) {
			dismissedRef.current.orbs = true;
			setActiveHint(undefined);
		}
	}, [activeHint, hasSpentOrbs]);

	// Hide hints when player dies
	useEffect(() => {
		if (!isAlive) setActiveHint(undefined);
	}, [isAlive]);

	const hintText = activeHint === "area" ? HINT_AREA : activeHint === "orbs" ? HINT_ORBS : undefined;

	const dismiss = () => {
		if (activeHint !== undefined) {
			dismissedRef.current[activeHint] = true;
			setActiveHint(undefined);
		}
	};

	return <TutorialHint text={hintText ?? ""} visible={hintText !== undefined} onDismiss={dismiss} />;
}

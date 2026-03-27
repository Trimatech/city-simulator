import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { USER_NAME } from "shared/constants/core";
import { selectPlayerLifetimeGamesPlayed, selectPlayerLifetimeOrbsSpent } from "shared/store/saves/save-selectors";
import { selectLocalSoldier } from "shared/store/soldiers";

import { TutorialHint } from "./TutorialHint";

const SHOW_DELAY_SECONDS = 4;
const ORBS_HINT_DELAY_SECONDS = 3;
const MAX_GAMES_FOR_HINTS = 3;

const HINT_AREA =
	"Leave your area to claim new ground! Orbs inside will be auto-collected. <font color='#ffea00'>Tip:</font> don't grab too much at once - if an enemy touches your trail wall, you're eliminated!";
const HINT_ORBS =
	"Use collected orbs for abilities! Check the powerup buttons on the right to activate shields, turbo, lasers and more.";

type HintId = "area" | "orbs";

export function TutorialHints() {
	const gamesPlayed = useSelectorCreator(selectPlayerLifetimeGamesPlayed, USER_NAME);
	const orbsSpent = useSelectorCreator(selectPlayerLifetimeOrbsSpent, USER_NAME);
	const soldier = useSelector(selectLocalSoldier);

	const dismissedRef = useRef<Record<HintId, boolean>>({ area: false, orbs: false });
	const [activeHint, setActiveHint] = useState<HintId | undefined>(undefined);

	const isNewPlayer = gamesPlayed < MAX_GAMES_FOR_HINTS;
	const isAlive = soldier !== undefined && !soldier.dead;
	const hasLeftArea = soldier !== undefined && !soldier.isInside;
	const hasOrbs = (soldier?.orbs ?? 0) > 0;
	const hasSpentOrbs = orbsSpent > 0;

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

	// Auto-dismiss area hint when player leaves their area
	useEffect(() => {
		if (activeHint === "area" && hasLeftArea) {
			dismissedRef.current.area = true;
			setActiveHint(undefined);
		}
	}, [activeHint, hasLeftArea]);

	// Tip 2: Show orbs hint after area hint is dismissed and player has orbs
	useEffect(() => {
		if (
			!isNewPlayer ||
			!isAlive ||
			dismissedRef.current.orbs ||
			!dismissedRef.current.area ||
			!hasOrbs ||
			hasSpentOrbs
		)
			return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= ORBS_HINT_DELAY_SECONDS) {
				setActiveHint("orbs");
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isNewPlayer, isAlive, hasOrbs, hasSpentOrbs, dismissedRef.current.area]);

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

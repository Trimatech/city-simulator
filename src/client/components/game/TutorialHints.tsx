import React, { useEffect, useState } from "@rbxts/react";
import { useSelector, useSelectorCreator } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { USER_NAME } from "shared/constants/core";
import { selectPlayerLifetimeArea, selectPlayerLifetimeOrbsSpent } from "shared/store/saves/save-selectors";
import { selectLocalSoldier } from "shared/store/soldiers";

import { TutorialHint } from "./TutorialHint";

const SHOW_DELAY_SECONDS = 2;

const HINT_AREA =
	"Welcome to Zone Wars! Here's how to expand your territory:\n\n• Go <b>outside</b> your zone.\n• A <b>wall</b> trails behind you as you move.\n• <b>Loop back</b> to claim the enclosed land.\n• <font color='#ffea00'>Danger:</font> enemies can hit your <b>trail wall</b> before you return";
const HINT_ORBS =
	"You've got <b>orbs</b>! Spend them on <b>abilities</b> using the buttons on the right: Shields, turbo, laser and more";

type HintId = "area" | "orbs";

export function TutorialHints() {
	const lifetimeArea = useSelectorCreator(selectPlayerLifetimeArea, USER_NAME);
	const orbsSpent = useSelectorCreator(selectPlayerLifetimeOrbsSpent, USER_NAME);
	const soldier = useSelector(selectLocalSoldier);

	const [activeHint, setActiveHint] = useState<HintId | undefined>(undefined);
	const [dismissed, setDismissed] = useState(false);

	const isAlive = soldier !== undefined && !soldier.dead;
	const needsAreaHint = lifetimeArea === 0;
	const needsOrbsHint = orbsSpent === 0;

	// Show the appropriate hint after a delay when spawned
	useEffect(() => {
		if (!isAlive || dismissed) return;

		const hint: HintId | undefined = needsAreaHint ? "area" : needsOrbsHint ? "orbs" : undefined;
		if (hint === undefined) return;

		const startTime = os.clock();
		const connection = RunService.Heartbeat.Connect(() => {
			if (os.clock() - startTime >= SHOW_DELAY_SECONDS) {
				setActiveHint(hint);
				connection.Disconnect();
			}
		});

		return () => connection.Disconnect();
	}, [isAlive, needsAreaHint, needsOrbsHint, dismissed]);

	// Auto-dismiss area hint when player claims land
	useEffect(() => {
		if (activeHint === "area" && !needsAreaHint) {
			setActiveHint(undefined);
			setDismissed(false); // allow orbs hint to show next
		}
	}, [activeHint, needsAreaHint]);

	// Auto-dismiss orbs hint when player spends orbs
	useEffect(() => {
		if (activeHint === "orbs" && !needsOrbsHint) {
			setActiveHint(undefined);
		}
	}, [activeHint, needsOrbsHint]);

	// Hide hints when player dies
	useEffect(() => {
		if (!isAlive) {
			setActiveHint(undefined);
			setDismissed(false);
		}
	}, [isAlive]);

	const hintText = activeHint === "area" ? HINT_AREA : activeHint === "orbs" ? HINT_ORBS : undefined;

	const dismiss = () => {
		if (activeHint !== undefined) {
			setDismissed(true);
			setActiveHint(undefined);
		}
	};

	return <TutorialHint text={hintText ?? ""} visible={hintText !== undefined} onDismiss={dismiss} />;
}

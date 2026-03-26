import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { store } from "client/store";
import { selectCachedDeadline } from "client/store/screen";
import {
	selectHasLocalSoldier,
	selectLocalDeathChoiceDeadline,
	selectLocalSoldier,
} from "shared/store/soldiers";

import { GameUI } from "./game/GameUI";
import { DeathScreen } from "./game/death/DeathScreen";
import { Home } from "./menu/home/home";

export function Screens() {
	const soldier = useSelector(selectLocalSoldier);
	const deathChoiceDeadline = useSelector(selectLocalDeathChoiceDeadline);
	const spawned = useSelector(selectHasLocalSoldier);
	const cachedDeadline = useSelector(selectCachedDeadline);
useEffect(() => {
		if (deathChoiceDeadline !== undefined) {
			warn(
				`[Death:Client] deathChoiceDeadline received: ${deathChoiceDeadline}, timeLeft=${deathChoiceDeadline - Workspace.GetServerTimeNow()}s`,
			);
			store.setCachedDeadline(deathChoiceDeadline);
		}
	}, [deathChoiceDeadline]);

	useEffect(() => {
		if (soldier && !soldier.dead) {
			if (cachedDeadline !== undefined) {
				warn(`[Death:Client] Soldier alive, clearing cachedDeadline`);
			}
			store.setCachedDeadline(undefined);
		}
	}, [soldier, soldier?.dead]);

	useEffect(() => {
		warn(
			`[Death:Client] State: spawned=${spawned}, dead=${soldier?.dead}, deadline=${deathChoiceDeadline}, cached=${cachedDeadline}, isDeathActive=${cachedDeadline !== undefined}`,
		);
	}, [spawned, soldier?.dead, deathChoiceDeadline, cachedDeadline]);

	const isDeathActive = cachedDeadline !== undefined;
	const gameUIVisible = spawned && !soldier?.dead;
	const homeVisible = !spawned && !isDeathActive;

	return (
		<>
			{spawned && <GameUI visible={gameUIVisible} />}
			<DeathScreen activeDeadline={cachedDeadline} onDismiss={() => store.setCachedDeadline(undefined)} />
			{!spawned && <Home visible={homeVisible} />}
		</>
	);
}

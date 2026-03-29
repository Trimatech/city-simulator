import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import { store } from "client/store";
import { selectCachedDeadline, selectWinData } from "client/store/screen";
import { remotes } from "shared/remotes";
import {
	selectHasLocalSoldier,
	selectLocalDeathChoiceDeadline,
	selectLocalSoldier,
} from "shared/store/soldiers";

import { GameUI } from "./game/GameUI";
import { DeathScreen } from "./game/death/DeathScreen";
import { WinScreen } from "./game/win/WinScreen";
import { Home } from "./menu/home/home";

const WIN_COUNTDOWN_SEC = 15;

export function Screens() {
	const soldier = useSelector(selectLocalSoldier);
	const deathChoiceDeadline = useSelector(selectLocalDeathChoiceDeadline);
	const spawned = useSelector(selectHasLocalSoldier);
	const cachedDeadline = useSelector(selectCachedDeadline);
	const winData = useSelector(selectWinData);

	// Listen for world domination win events
	useEffect(() => {
		const disconnect = remotes.client.worldDominationWin.connect(
			(winnerId, winnerName, winnerUserId, areaPercent, eliminations, moneyEarned, crystalsEarned) => {
				// Clear death screen if active
				store.setCachedDeadline(undefined);
				store.setWinData({
					winnerId,
					winnerName,
					winnerUserId,
					areaPercent,
					eliminations,
					moneyEarned,
					crystalsEarned,
					deadline: Workspace.GetServerTimeNow() + WIN_COUNTDOWN_SEC,
				});
			},
		);
		return () => disconnect();
	}, []);

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

	const isWinActive = winData !== undefined;
	const isDeathActive = cachedDeadline !== undefined;
	const gameUIVisible = spawned && !soldier?.dead;
	const homeVisible = !spawned && !isDeathActive && !isWinActive;

	return (
		<>
			{spawned && <GameUI visible={gameUIVisible} />}
			{!isWinActive && (
				<DeathScreen activeDeadline={cachedDeadline} onDismiss={() => store.setCachedDeadline(undefined)} />
			)}
			<WinScreen winData={winData} onDismiss={() => store.setWinData(undefined)} />
			{!spawned && <Home visible={homeVisible} />}
		</>
	);
}

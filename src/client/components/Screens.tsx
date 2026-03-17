import React, { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Workspace } from "@rbxts/services";
import {
	selectHasLocalSoldier,
	selectLocalDeathChoiceDeadline,
	selectLocalSoldier,
	selectLocalTurboActiveUntil,
} from "shared/store/soldiers";

import { DeathScreen } from "./game/death/DeathScreen";
import { GameUI } from "./game/GameUI";
import { SpeedEffect } from "./game/SpeedEffect";
import { Home } from "./menu/home/home";

export function Screens() {
	const soldier = useSelector(selectLocalSoldier);
	const deathChoiceDeadline = useSelector(selectLocalDeathChoiceDeadline);
	const spawned = useSelector(selectHasLocalSoldier);

	// Cache deadline locally so the death screen persists even if soldier is removed from store mid-timer
	const [cachedDeadline, setCachedDeadline] = useState<number | undefined>();

	useEffect(() => {
		if (deathChoiceDeadline !== undefined) {
			warn(
				`[Death:Client] deathChoiceDeadline received: ${deathChoiceDeadline}, timeLeft=${deathChoiceDeadline - Workspace.GetServerTimeNow()}s`,
			);
			setCachedDeadline(deathChoiceDeadline);
		}
	}, [deathChoiceDeadline]);

	// If soldier is alive (revived), clear cache to hide death screen immediately
	useEffect(() => {
		if (soldier && !soldier.dead) {
			if (cachedDeadline !== undefined) {
				warn(`[Death:Client] Soldier alive, clearing cachedDeadline`);
			}
			setCachedDeadline(undefined);
		}
	}, [soldier, soldier?.dead]);

	useEffect(() => {
		warn(
			`[Death:Client] State: spawned=${spawned}, dead=${soldier?.dead}, deadline=${deathChoiceDeadline}, cached=${cachedDeadline}, isDeathActive=${cachedDeadline !== undefined}`,
		);
	}, [spawned, soldier?.dead, deathChoiceDeadline, cachedDeadline]);

	const turboActiveUntil = useSelector(selectLocalTurboActiveUntil);

	const isDeathActive = cachedDeadline !== undefined;
	const gameUIVisible = spawned && !soldier?.dead;
	const homeVisible = !spawned && !isDeathActive;

	return (
		<>
			{spawned && <GameUI visible={gameUIVisible} />}
			<DeathScreen activeDeadline={cachedDeadline} onDismiss={() => setCachedDeadline(undefined)} />
			{!spawned && <Home visible={homeVisible} />}
			{turboActiveUntil > 0 && (
				<frame
					key={`speed-${turboActiveUntil}`}
					Size={new UDim2(1, 0, 1, 0)}
					AnchorPoint={new Vector2(0, 0)}
					BackgroundTransparency={1}
				>
					<SpeedEffect />
				</frame>
			)}
		</>
	);
}

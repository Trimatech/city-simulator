import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { useMotion } from "client/hooks";
import { selectCachedDeadline } from "client/store/screen";
import { selectWorldSubject } from "client/store/world";
import { useRem } from "client/ui/rem/useRem";
import { selectHasLocalSoldier, selectLocalSoldier } from "shared/store/soldiers";

import { GameTopbar } from "./menu/home/GameTopbar";
import { HomeTopbar } from "./menu/home/HomeTopbar";

export function TopbarScreens() {
	const rem = useRem();
	const spawned = useSelector(selectHasLocalSoldier);
	const soldier = useSelector(selectLocalSoldier);
	const cachedDeadline = useSelector(selectCachedDeadline);
	const inGame = useSelector(selectWorldSubject) !== undefined;
	const [transition, transitionMotion] = useMotion(0);

	useEffect(() => {
		transitionMotion.spring(inGame ? 1 : 0);
	}, [inGame]);

	const isDeathActive = cachedDeadline !== undefined;
	const gameUIVisible = spawned && !soldier?.dead;
	const homeVisible = !spawned && !isDeathActive;

	return (
		<>
			{spawned && <GameTopbar visible={gameUIVisible} />}
			{!spawned && <HomeTopbar visible={homeVisible} />}
		</>
	);
}

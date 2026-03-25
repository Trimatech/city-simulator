import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Transition } from "@rbxts-ui/layout";
import { useMotion } from "client/hooks";
import { selectCachedDeadline } from "client/store/screen";
import { selectWorldSubject } from "client/store/world";
import { SlideIn } from "client/ui/slide-in";
import { selectHasLocalSoldier, selectLocalSoldier } from "shared/store/soldiers";

import { HealthView } from "./game/health/HealthView";
import { HomeTopbar } from "./menu/home/HomeTopbar";

export function TopbarScreens() {
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
			{spawned && (
				<Transition groupTransparency={lerpBinding(transition, 1, 0)} size={new UDim2(1, 0, 1, 0)}>
					<SlideIn visible={gameUIVisible} direction="left">
						<HealthView />
					</SlideIn>
				</Transition>
			)}
			<HomeTopbar visible={homeVisible} />
		</>
	);
}

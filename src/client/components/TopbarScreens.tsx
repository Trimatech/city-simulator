import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HStack, Transition } from "@rbxts-ui/layout";
import { useMotion } from "client/hooks";
import { store } from "client/store";
import { MenuWindow, selectCachedDeadline } from "client/store/screen";
import { selectWorldSubject } from "client/store/world";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";
import { selectHasLocalSoldier, selectLocalSoldier } from "shared/store/soldiers";

import { HealthView } from "./game/health/HealthView";
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
			{spawned && (
				<Transition groupTransparency={lerpBinding(transition, 1, 0)} size={new UDim2(1, 0, 1, 0)}>
					<SlideIn visible={gameUIVisible} direction="left">
						<HStack
							verticalAlignment={Enum.VerticalAlignment.Center}
							spacing={rem(1)}
							size={new UDim2(1, 0, 0, 0)}
							automaticSize={Enum.AutomaticSize.Y}
						>
							<MainButton
								onClick={() => store.setOpenMenuWindow(MenuWindow.Progress)}
								size={new UDim2(0, rem(13), 0, rem(4))}
								fitContent
							>
								<ShopButtonTextWithIcon text="Progress" icon={assets.ui.icons.rank} />
							</MainButton>
							<HealthView />
						</HStack>
					</SlideIn>
				</Transition>
			)}
			<HomeTopbar visible={homeVisible} />
		</>
	);
}

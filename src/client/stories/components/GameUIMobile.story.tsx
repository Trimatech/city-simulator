import "client/app/react-config";

import { useInterval, useTimeout } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { GameUIMobile } from "client/components/game/GameUIMobile";
import { TopbarScreens } from "client/components/TopbarScreens";
import { IsMobileProvider } from "client/hooks/use-is-mobile";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME, WORLD_BOUNDS } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { defaultPlayerSave } from "shared/store/saves";
import { fillArray } from "shared/utils/object-utils";

import { FakeTopbar } from "../utils/FakeTopbar";
import { useMockRemotes } from "../utils/use-mock-remotes";

const IDS = [USER_NAME, ...fillArray(10, (index) => `${index}`)];

function GameUIMobileStoryContent() {
	useMockRemotes();

	useEffect(() => {
		store.setPlayerSave(USER_NAME, { ...defaultPlayerSave, balance: 175 });

		for (const id of IDS) {
			store.addSoldier(id, {
				name: id,
				position:
					id === USER_NAME
						? Vector2.zero
						: new Vector2(
								math.random(-WORLD_BOUNDS, WORLD_BOUNDS),
								math.random(-WORLD_BOUNDS, WORLD_BOUNDS),
							),
				skin: getRandomBotSkin().id,
				orbs: math.random(0, 5000),
			});
		}
	}, []);

	useTimeout(() => {
		for (const id of IDS) {
			store.setSoldierIsInside(id, false);
		}
	}, 2);

	useInterval(() => {
		for (const id of IDS) {
			if (id !== USER_NAME) {
				//store.turnSoldier(id, math.random() * 2 * math.pi);
			}
		}
	}, 1.5);

	return (
		<IsMobileProvider value={true}>
			<RootProvider>
				<FakeTopbar header={<TopbarScreens />}>
					<GameUIMobile visible />
				</FakeTopbar>
			</RootProvider>
		</IsMobileProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <GameUIMobileStoryContent />,
};

export = story;

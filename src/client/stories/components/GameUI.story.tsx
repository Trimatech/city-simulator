import "client/app/react-config";

import { useInterval, useTimeout } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { GameUI } from "client/components/game/GameUI";
import { TopbarScreens } from "client/components/TopbarScreens";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME, WORLD_BOUNDS } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { fillArray } from "shared/utils/object-utils";

import { FakeTopbar } from "../utils/FakeTopbar";
import { useMockRemotes } from "../utils/use-mock-remotes";

const IDS = [USER_NAME, ...fillArray(10, (index) => `${index}`)];

function GameUIStoryContent() {
	useMockRemotes();

	useEffect(() => {
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
		<RootProvider>
			<FakeTopbar header={<TopbarScreens />}>
				<GameUI visible />
			</FakeTopbar>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <GameUIStoryContent />,
};

export = story;

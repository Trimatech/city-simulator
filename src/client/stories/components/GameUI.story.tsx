import "client/app/react-config";

import { hoarcekat, useInterval, useTimeout } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { GameUI } from "client/components/game";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME, WORLD_BOUNDS } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";
import { fillArray } from "shared/utils/object-utils";

import { useMockRemotes } from "../utils/use-mock-remotes";

const IDS = [USER_NAME, ...fillArray(10, (index) => `${index}`)];

export = hoarcekat(() => {
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
		// store.populateCandy(
		// 	fillArray(512, (index) => ({
		// 		id: `test-${index}`,
		// 		type: CandyType.Default,
		// 		position: new Vector2(
		// 			(math.random() * 2 - 1) * WORLD_BOUNDS * 0.2,
		// 			(math.random() * 2 - 1) * WORLD_BOUNDS * 0.2,
		// 		),
		// 		size: math.random(1, 10),
		// 		color: getRandomAccent(),
		// 	})),
		// );
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
			<GameUI />
		</RootProvider>
	);
});

import "client/app/react-config";

import { hoarcekat, useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { Controller } from "client/components/controller";
import { World } from "client/components/world/World";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { getRandomAccent } from "shared/constants/palette";
import { getRandomBaseSoldierSkin } from "shared/constants/skins";
import { selectCandyGridResolution } from "shared/store/candy-grid/candy-grid-selectors";
import { CandyGridCell } from "shared/store/candy-grid/candy-grid-types";
import { CandyEntity, CandyType } from "shared/store/candy-grid/candy-types";
import { fillArray } from "shared/utils/object-utils";

import { useMockRemotes } from "../utils/use-mock-remotes";

const IDS = [USER_NAME, ...fillArray(10, (index) => `${index}`)];

export = hoarcekat(() => {
	useMockRemotes();

	useEffect(() => {
		for (const id of IDS) {
			store.addSoldier(id, {
				name: id,
				position: new Vector2(math.random(-10, 10), math.random(-10, 10)),
				skin: getRandomBaseSoldierSkin().id,
				orbs: math.random(0, 8000),
			});
		}

		// Populate candyGrid cells directly for the story
		const res = store.getState(selectCandyGridResolution);
		const byCell: { [cellKey: string]: { [id: string]: CandyEntity } } = {};
		for (const index of $range(0, 49)) {
			const entity: CandyEntity = {
				id: `${index}`,
				position: new Vector2(math.random(-50, 50), math.random(-25, 25)),
				size: math.random(1, 50),
				color: getRandomAccent(),
				type: CandyType.Default,
			};
			const x = math.floor(entity.position.X / res);
			const y = math.floor(entity.position.Y / res);
			const key = `${x},${y}`;
			(byCell[key] ||= {})[entity.id] = entity;
		}
		for (const [cellKey, cell] of pairs(byCell)) {
			store.setCandyCell(cellKey as string, cell as CandyGridCell);
		}
	}, []);

	useInterval(() => {
		for (const id of IDS) {
			if (id !== USER_NAME) {
				//	store.moveSoldier(id, math.random() * 2 * math.pi);
			}
		}
	}, 1.5);

	return (
		<RootProvider>
			<World />
			<Controller />
		</RootProvider>
	);
});

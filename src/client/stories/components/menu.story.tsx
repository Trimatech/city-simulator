import "client/app/react-config";

import { hoarcekat } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { Menu } from "client/components/menu";
import { World } from "client/components/world/World2";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { InputCapture } from "client/ui/input-capture";
import { USER_NAME } from "shared/constants/core";
import { selectSoldierById } from "shared/store/soldiers";

import { useMockRemotes } from "../utils/use-mock-remotes";

export = hoarcekat(() => {
	useMockRemotes();

	const toggle = () => {
		const soldier = store.getState(selectSoldierById(USER_NAME));

		if (soldier) {
			store.removeSoldier(USER_NAME);
		} else {
			store.addSoldier(USER_NAME);
		}
	};

	return (
		<RootProvider>
			<InputCapture
				onInputBegan={(rbx, input) => {
					if (input.KeyCode === Enum.KeyCode.F) {
						toggle();
					}
				}}
			/>
			<World />
			<Menu />
		</RootProvider>
	);
});

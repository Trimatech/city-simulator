import React from "@rbxts/react";
import { GridWalls } from "client/components/walls/GridWalls";
import { RemProvider } from "client/rem/rem-provider";
import { Group } from "client/ui/layout/group";

import { Bots } from "./bots/Bots";
import { Soldiers } from "./soldiers/Soldiers";
import { WorldSounds } from "./WorldSounds";
import { WorldSubject } from "./WorldSubject";

export function World() {
	return (
		<RemProvider minimumRem={6}>
			<Group name="World">
				<WorldSubject />
				<GridWalls />
				<Soldiers />

				<Bots />

				<WorldSounds />

				{/* <Candies />

				<Towers /> */}
			</Group>
		</RemProvider>
	);
}

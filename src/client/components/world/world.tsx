import React from "@rbxts/react";
import { MemoGridWalls } from "client/components/walls/GridWalls";
import { RemProvider } from "client/rem/rem-provider";
import { Group } from "client/ui/layout/group";

import { Bots } from "./bots/Bots";
import { Soldiers } from "./soldiers";
import { WorldSounds } from "./world-sounds";
import { WorldSubject } from "./world-subject";

export function World() {
	return (
		<RemProvider minimumRem={6}>
			<Group name="World">
				<WorldSubject />
				<MemoGridWalls />
				<Soldiers />

				<Bots />

				<WorldSounds />

				{/* <Candies />

				<Towers /> */}
			</Group>
		</RemProvider>
	);
}

import React from "@rbxts/react";
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
				<Soldiers />

				<Bots />

				<WorldSounds />

				{/* <Candies />

				<Towers /> */}
			</Group>
		</RemProvider>
	);
}

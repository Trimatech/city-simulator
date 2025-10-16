import React from "@rbxts/react";
import { RemProvider } from "client/rem/rem-provider";
import { Group } from "client/ui/layout/group";

import { Bots } from "./bots/Bots";
import { Candies } from "./candies/Candies";
import { ExplosionEffects } from "./explosions/ExplosionEffects";
import { Soldiers } from "./soldiers";
import { Towers } from "./towers/Towers";
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

				<Candies />

				<Towers />

				<ExplosionEffects />
			</Group>
		</RemProvider>
	);
}

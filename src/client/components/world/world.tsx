import React from "@rbxts/react";
import { Group } from "client/components/ui/group";
import { RemProvider } from "client/providers/rem-provider";

import { Candies } from "./candies/Candies";
import { Soldiers } from "./soldiers";
import { Towers } from "./towers/Towers";
import { WorldSounds } from "./world-sounds";

export function World() {
	return (
		<RemProvider minimumRem={6}>
			<Group>
				<Soldiers />

				<WorldSounds />

				<Candies />

				<Towers />
			</Group>
		</RemProvider>
	);
}

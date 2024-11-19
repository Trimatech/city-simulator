import React from "@rbxts/react";
import { Group } from "client/components/ui/group";
import { RemProvider } from "client/providers/rem-provider";

import { Snakes } from "./snakes";
import { WorldSounds } from "./world-sounds";

export function World() {
	return (
		<RemProvider minimumRem={6}>
			<Group>
				<Snakes />
				<WorldSounds />
			</Group>
		</RemProvider>
	);
}

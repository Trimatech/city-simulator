import React from "@rbxts/react";
import { Group } from "@rbxts-ui/primitives";
import { RemProvider } from "client/ui/rem/RemProvider";

import { Bots } from "./bots/Bots";
import { PlayerGlows } from "./glow/PlayerGlows";
import { Towers } from "./towers/Towers";
import { WorldSounds } from "./WorldSounds";
import { WorldSubject } from "./WorldSubject";

export function World() {
	return (
		<RemProvider minimumRem={6}>
			<Group name="World">
				<WorldSubject />
				{/* Walls are now created server-side and animated via CollectionService */}
				{/* <Soldiers /> */}

				<Bots />
				<PlayerGlows />

				<WorldSounds />

				{/* Candies are now created server-side and animated via CollectionService */}

				<Towers />
			</Group>
		</RemProvider>
	);
}

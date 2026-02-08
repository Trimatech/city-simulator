import React from "@rbxts/react";
import { RemProvider } from "client/rem/rem-provider";
import { Group } from "client/ui/layout/group";

import { Bots } from "./bots/Bots";
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

				<WorldSounds />

				{/* Candies are now created server-side and animated via CollectionService */}

				<Towers />
			</Group>
		</RemProvider>
	);
}

import Object from "@rbxts/object-utils";
import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Group } from "client/components/ui/group";
import { selectSnakesById } from "shared/store/snakes";

import { Snake } from "./snake";

export function Snakes() {
	const snakes = useSelector(selectSnakesById);

	return (
		<Group zIndex={2}>
			{Object.values(snakes).map((snake) => {
				return <Snake key={snake.id} snake={snake} />;
			})}
		</Group>
	);
}

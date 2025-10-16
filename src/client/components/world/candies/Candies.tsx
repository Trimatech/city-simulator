import React, { memo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectCandies } from "shared/store/candy/candy-selectors";

import { useCharacterPosition } from "../../../hooks/use-character-position";
import { Candy } from "./Candy";

const VISIBLE_RADIUS_STUDS = 300;

function CandiesComponent() {
	const candies = useSelector(selectCandies);
	const characterPosition = useCharacterPosition();
	const characterPositionValue = characterPosition.getValue();

	return (
		<>
			{candies
				// .filter((candy) => {
				// 	if (!characterPositionValue) return false;
				// 	const distance = candy.position.sub(characterPositionValue).Magnitude;
				// 	return distance <= VISIBLE_RADIUS_STUDS;
				// })
				.map((candy) => (
					<Candy
						key={candy.id}
						name={`candy_${candy.id}`}
						position={candy.position}
						color={candy.color}
						size={candy.size}
						eatenAt={candy.eatenAt}
					/>
				))}
		</>
	);
}

export const Candies = memo(CandiesComponent);

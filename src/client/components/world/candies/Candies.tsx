import React, { memo } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectCandies } from "shared/store/candy/candy-selectors";

import { Candy } from "./Candy";

function CandiesComponent() {
	const candies = useSelector(selectCandies);

	return (
		<>
			{candies.map((candy) => (
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

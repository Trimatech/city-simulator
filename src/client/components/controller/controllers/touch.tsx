import React, { useEffect } from "@rbxts/react";

import { useTouchMove } from "../utils/use-touch-move";

interface TouchProps {
	readonly setBoost: (boost: boolean) => void;
}

export function Touch({ setBoost }: TouchProps) {
	const [direction, jumping] = useTouchMove();

	useEffect(() => {
		if (direction !== Vector2.zero) {
			setBoost(true);
		}
	}, [direction]);

	useEffect(() => {
		setBoost(jumping);
	}, [jumping]);

	return <></>;
}

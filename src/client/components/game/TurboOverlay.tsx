import React from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectLocalTurboActiveUntil } from "shared/store/soldiers";

import { SpeedEffect } from "./SpeedEffect";

export function TurboOverlay() {
	const turboActiveUntil = useSelector(selectLocalTurboActiveUntil);

	if (turboActiveUntil <= 0) return undefined;

	return (
		<frame
			key={`speed-${turboActiveUntil}`}
			Size={new UDim2(1, 0, 1, 0)}
			AnchorPoint={new Vector2(0, 0)}
			BackgroundTransparency={1}
		>
			<SpeedEffect />
		</frame>
	);
}

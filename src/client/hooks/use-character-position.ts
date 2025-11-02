import { useBinding, useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { getObserverPosition2D } from "client/utils/camera-position.utils";
import { selectLocalIsSpawned } from "shared/store/soldiers";

export function useCharacterPosition() {
	const [position, setPosition] = useBinding<Vector2 | undefined>(undefined);
	const isSpawned = useSelector(selectLocalIsSpawned);

	useEffect(() => {
		const connection = RunService.Heartbeat.Connect(() => {
			const pos = getObserverPosition2D({ preferCamera: !isSpawned });
			setPosition(pos);
		});

		return () => connection.Disconnect();
	}, [isSpawned]);

	return position;
}

import { useEffect, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { getObserverPosition2D } from "client/utils/camera-position.utils";
import { selectLocalIsSpawned } from "shared/store/soldiers";

export function useObserverPosition() {
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);
	const isSpawned = useSelector(selectLocalIsSpawned);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			setPosition(getObserverPosition2D({ preferCamera: !isSpawned }));
		});
		return () => conn.Disconnect();
	}, [isSpawned]);

	return position;
}



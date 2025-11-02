import { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { RunService } from "@rbxts/services";
import { getObserverPosition2D } from "client/utils/camera-position.utils";
import { selectLocalIsSpawned } from "shared/store/soldiers";

export interface UseCharacterPositionOptions {
	resolution?: number;
}

export function useCharacterPositionRounded({ resolution = 10 }: UseCharacterPositionOptions = {}) {
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);
	const last = useRef<Vector2 | undefined>(undefined);
	const isSpawned = useSelector(selectLocalIsSpawned);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			const pos2d = getObserverPosition2D({ preferCamera: !isSpawned });

			if (!pos2d) {
				setPosition(undefined);
				return;
			}

			const snappedX = math.round(pos2d.X * resolution) / resolution;
			const snappedY = math.round(pos2d.Y * resolution) / resolution;

			const prev = last.current;
			if (prev?.X !== snappedX || prev?.Y !== snappedY) {
				const v = new Vector2(snappedX, snappedY);
				last.current = v;
				setPosition(v);
			}
		});
		return () => conn.Disconnect();
	}, [isSpawned]);

	return position;
}

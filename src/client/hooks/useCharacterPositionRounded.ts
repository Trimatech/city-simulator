import { useEffect, useRef, useState } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";

export interface UseCharacterPositionOptions {
	resolution?: number;
}

export function useCharacterPositionRounded({ resolution = 10 }: UseCharacterPositionOptions = {}) {
	const [position, setPosition] = useState<Vector2 | undefined>(undefined);
	const last = useRef<Vector2 | undefined>(undefined);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => {
			const character = Players.LocalPlayer?.Character;
			if (!character) {
				setPosition(undefined);
				return;
			}

			const pivot = character.GetPivot();
			const pos2d = new Vector2(pivot.Position.X, pivot.Position.Z);

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
	}, []);

	return position;
}

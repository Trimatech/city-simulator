import { useBinding, useEffect } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";

export function useCharacterPosition() {
	const localPlayer = Players.LocalPlayer;
	const [position, setPosition] = useBinding<Vector2 | undefined>(undefined);

	useEffect(() => {
		const connection = RunService.Heartbeat.Connect(() => {
			const character = localPlayer?.Character;
			if (!character) {
				setPosition(undefined);
				return;
			}
			const pivot = character.GetPivot();
			setPosition(new Vector2(pivot.Position.X, pivot.Position.Z));
		});

		return () => connection.Disconnect();
	}, []);

	return position;
}

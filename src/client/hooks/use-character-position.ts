import { useBinding, useEffect } from "@rbxts/react";
import { Players, RunService } from "@rbxts/services";

export function useCharacterPosition() {
	const localPlayer = Players.LocalPlayer;
	const character = localPlayer.Character;
	const [position, setPosition] = useBinding<Vector2 | undefined>(undefined);

	useEffect(() => {
		if (!character) return;

		const connection = RunService.Heartbeat.Connect(() => {
			const pivot = character.GetPivot();
			setPosition(new Vector2(pivot.Position.X, pivot.Position.Z));
		});

		return () => connection.Disconnect();
	}, [character]);

	return position;
}

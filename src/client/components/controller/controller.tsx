import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { Players, RunService, Workspace } from "@rbxts/services";
import { WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { selectLocalIsSpawned, selectLocalTurboActiveUntil } from "shared/store/soldiers";

export function Controller() {
	const isSpawned = useSelector(selectLocalIsSpawned);
	const turboActiveUntil = useSelector(selectLocalTurboActiveUntil);

	useInterval(() => {
		if (!isSpawned) return;
		const position = Players.LocalPlayer?.Character?.PrimaryPart?.Position;
		if (position) {
			const vector2 = new Vector2(position.X, position.Z);
			remotes.soldier.move.fire(vector2);
		}
	}, WORLD_TICK);

	// Force the character to move forward while turbo is active
	// Runs after Roblox's default control module (RenderPriority.Input = 100)
	useEffect(() => {
		if (!isSpawned || turboActiveUntil <= 0) return;

		const BINDING_NAME = "TurboForceMove";
		const AFTER_INPUT = Enum.RenderPriority.Input.Value + 1;

		RunService.BindToRenderStep(BINDING_NAME, AFTER_INPUT, () => {
			if (Workspace.GetServerTimeNow() >= turboActiveUntil) return;

			const character = Players.LocalPlayer?.Character;
			const humanoid = character?.FindFirstChildOfClass("Humanoid");
			const rootPart = character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
			if (!humanoid || !rootPart) return;

			if (humanoid.MoveDirection.Magnitude < 0.01) {
				const look = rootPart.CFrame.LookVector;
				humanoid.Move(new Vector3(look.X, 0, look.Z));
			}
		});

		return () => RunService.UnbindFromRenderStep(BINDING_NAME);
	}, [isSpawned, turboActiveUntil]);

	return <></>;
}

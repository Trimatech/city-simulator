import { Players } from "@rbxts/services";
import { remotes } from "shared/remotes";

export function placeTowerAtPlayer() {
	const cf = Players.LocalPlayer.Character?.PrimaryPart?.CFrame;

	if (cf) {
		const forwardVector = cf.LookVector.mul(10);
		const newPosition = cf.Position.add(forwardVector);
		const position = new Vector2(newPosition.X, newPosition.Z);
		remotes.soldier.placeTower.fire(position);
	} else {
		warn("No cframe");
	}
}

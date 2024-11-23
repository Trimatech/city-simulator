import { getPlayerHumanoidByName } from "server/world/utils";

export function setSoldierSpeed(name: string, speed: number) {
	const humanoid = getPlayerHumanoidByName(name);
	if (humanoid) {
		humanoid.WalkSpeed = speed;
	}
}

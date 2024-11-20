import { SoldierEntity } from "./soldier-slice";

interface SoldierDescription {
	readonly length: number;
	readonly radius: number;
	readonly spacingAtHead: number;
	readonly spacingAtTail: number;
	readonly turnSpeed: number;
}

export function soldierIsBoosting(soldier: SoldierEntity) {
	return soldier.boost && soldier.score > 10;
}

export function describeSoldierFromScore(score: number): SoldierDescription {
	const radius = math.max(0.7 * math.log10(score / 300 + 2), 0.5);

	return {
		radius,
		spacingAtHead: math.max(0.75 * radius, 0.5),
		spacingAtTail: 2.5 * radius,
		length: 64 * math.log10(score / 256 + 1) + 3,
		turnSpeed: math.rad(math.max(360 - 100 * math.log10(score / 150 + 1), 45)),
	};
}

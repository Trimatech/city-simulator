import { store } from "server/store";
import { WORLD_BOUNDS } from "shared/constants/core";
import { selectSoldierById } from "shared/store/soldiers";

/**
 * Returns a soldier by id from the store.
 */
export function getSoldier(soldierId: string) {
	return store.getState(selectSoldierById(soldierId));
}

/**
 * Returns a random point in the world. If the margin is specified,
 * the point will be within this percentage of the world bounds.
 */
export function getRandomPointInWorld(margin = 1) {
	const random = new Random();
	let position = new Vector2();

	do {
		const x = random.NextNumber(-margin, margin);
		const y = random.NextNumber(-margin, margin);
		position = new Vector2(x, y).mul(WORLD_BOUNDS);
	} while (position.Magnitude > WORLD_BOUNDS);

	return position;
}

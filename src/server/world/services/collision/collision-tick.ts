import { store } from "server/store";
import { killSoldier } from "server/world/world.utils";
import { selectSoldiersSorted } from "shared/store/soldiers";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import {
	isCollidingWithOwnTracers,
	isCollidingWithSoldier,
	isCollidingWithWall,
	isInsidePolygon,
} from "./collision-tick.utils";

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest area is killed
	const soldiers = store.getState(selectSoldiersSorted((a, b) => a.polygonAreaSize < b.polygonAreaSize));

	for (const soldier of soldiers) {
		if (soldier.dead) {
			continue;
		}

		if (isCollidingWithWall(soldier)) {
			print(`Collided with wall, kill soldier ${soldier.id}`);
			killSoldier(soldier.id);
			continue;
		}

		debug.profilebegin("TICK_INSIDE");
		const isInside = isInsidePolygon(soldier);

		const hasChanged = soldier.isInside !== isInside;
		if (hasChanged) {
			store.setSoldierIsInside(soldier.id, isInside);
			soldierIsInsideChanged.Fire(soldier.id, isInside);
		}

		debug.profileend();

		// Check collision with enemy tracers first; give precedence over head-on
		// debug.profilebegin("TICK_ENEMY_TRACERS");
		// const ownerId = checkCollisionWithEnemyTracers(soldier);
		// debug.profileend();

		// if (ownerId) {
		// 	const owner = store.getState(selectSoldiersById)[ownerId];
		// 	if (owner && owner.shieldActive) {
		// 		print(`Collided with enemy tracer while owner shielded, kill collider ${soldier.id}`);
		// 		killSoldier(soldier.id);
		// 		store.playerKilledSoldier(ownerId, soldier.id);
		// 		store.incrementSoldierEliminations(ownerId);
		// 	} else {
		// 		print(`Collided with enemy tracer, kill owner ${ownerId}`);
		// 		killSoldier(ownerId);
		// 		store.playerKilledSoldier(soldier.id, ownerId);
		// 		store.incrementSoldierEliminations(soldier.id);
		// 	}
		// 	continue;
		// }

		// Check for collision with own tracers
		debug.profilebegin("TICK_OWN_TRACERS");

		if (!isInside && isCollidingWithOwnTracers(soldier)) {
			print(`Collided with own tracer, kill soldier ${soldier.id}`);
			killSoldier(soldier.id);
			continue;
		}
		debug.profileend();

		debug.profilebegin("TICK_ENEMY");
		// Finally, check head-on collision
		const enemy = isCollidingWithSoldier(soldier);
		if (enemy) {
			print(`Collided with enemy, kill soldier ${enemy.id}`);
			killSoldier(enemy.id);
			store.playerKilledSoldier(soldier.id, enemy.id);
			store.incrementSoldierEliminations(soldier.id);
		}
		debug.profileend();
	}
}

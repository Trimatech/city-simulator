import { store } from "server/store";
import { killSoldier } from "server/world/world.utils";
import { selectSoldiers, selectSoldiersById } from "shared/store/soldiers";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import {
	isCollidingWithEnemyTracers,
	isCollidingWithOwnTracers,
	isCollidingWithSoldier,
	isCollidingWithWall,
	isInsidePolygon,
} from "./collision-tick.utils";

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest area is killed

	const soldiers = store.getState(selectSoldiers);

	for (const soldier of soldiers) {
		if (soldier.dead) {
			continue;
		}

		// This is to prevent hackers claiming areas outside of the map
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

		//Check collision with enemy tracers first; give precedence over head-on
		debug.profilebegin("TICK_ENEMY_TRACERS");
		const enemyId = isCollidingWithEnemyTracers(soldier);
		debug.profileend();

		if (enemyId !== undefined) {
			const owner = store.getState(selectSoldiersById)[enemyId];
			if (owner && owner.shieldActive) {
				print(`Collided with enemy tracer while owner shielded, kill collider ${soldier.id}`);
				killSoldier(soldier.id);
				store.playerKilledSoldier(enemyId, soldier.id);
				store.incrementSoldierEliminations(enemyId);
			} else {
				print(`Collided with enemy tracer, kill owner ${enemyId}`);
				killSoldier(enemyId);
				store.playerKilledSoldier(soldier.id, enemyId);
				store.incrementSoldierEliminations(soldier.id);
			}
			continue;
		}

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

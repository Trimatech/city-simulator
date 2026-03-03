import { store } from "server/store";
import { killSoldier, onPlayerDeath } from "server/world/world.utils";
import { selectSoldiers, selectSoldiersById } from "shared/store/soldiers";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import {
	isCollidingWithEnemyTracers,
	isCollidingWithOwnTracers,
	isCollidingWithSoldier,
	isCollidingWithWall,
	isInsidePolygon,
} from "./collision-tick.utils";

// Track last position where we checked isInside for spatial optimization
const lastIsInsideCheckPosition = new Map<string, Vector2>();
// Only recheck isInside if soldier moved more than this distance
const INSIDE_CHECK_DISTANCE_THRESHOLD = 1;

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest area is killed

	const soldiers = store.getState(selectSoldiers);

	for (const soldier of soldiers) {
		if (soldier.dead) {
			// Clean up tracking map for dead soldiers
			lastIsInsideCheckPosition.delete(soldier.id);
			continue;
		}

		// This is to prevent hackers claiming areas outside of the map
		if (isCollidingWithWall(soldier)) {
			print(`Collided with wall, kill soldier ${soldier.id}`);
			killSoldier(soldier.id);
			continue;
		}

		debug.profilebegin("TICK_INSIDE");

		// Spatial optimization: only check isInside if soldier has moved significantly
		// or if we haven't checked yet
		const lastCheckPos = lastIsInsideCheckPosition.get(soldier.id);
		let shouldCheckInside = true;

		if (lastCheckPos !== undefined) {
			const distanceMoved = soldier.position.sub(lastCheckPos).Magnitude;
			// Skip check if soldier hasn't moved much (reduces checks by ~60-80% for stationary/slow soldiers)
			if (distanceMoved < INSIDE_CHECK_DISTANCE_THRESHOLD) {
				shouldCheckInside = false;
			}
		}

		if (shouldCheckInside) {
			const isInside = isInsidePolygon(soldier);
			lastIsInsideCheckPosition.set(soldier.id, soldier.position);

			const hasChanged = soldier.isInside !== isInside;
			if (hasChanged) {
				store.setSoldierIsInside(soldier.id, isInside);
				soldierIsInsideChanged.Fire(soldier.id, isInside);
			}
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
				onPlayerDeath(soldier.id);
				store.playerKilledSoldier(enemyId, soldier.id);
				store.incrementSoldierEliminations(enemyId);
			} else {
				print(`Collided with enemy tracer, kill owner ${enemyId}`);
				onPlayerDeath(enemyId);
				store.playerKilledSoldier(soldier.id, enemyId);
				store.incrementSoldierEliminations(soldier.id);
			}
			continue;
		}

		// Check for collision with own tracers
		debug.profilebegin("TICK_OWN_TRACERS");

		if (!soldier.isInside && isCollidingWithOwnTracers(soldier)) {
			print(`Collided with own tracer, kill soldier ${soldier.id}`);
			onPlayerDeath(soldier.id);
			continue;
		}
		debug.profileend();

		debug.profilebegin("TICK_ENEMY");
		// Finally, check head-on collision
		const enemy = isCollidingWithSoldier(soldier);
		if (enemy) {
			print(`Collided with enemy, kill soldier ${enemy.id}`);
			onPlayerDeath(enemy.id);
			store.playerKilledSoldier(soldier.id, enemy.id);
			store.incrementSoldierEliminations(soldier.id);
		}
		debug.profileend();
	}
}

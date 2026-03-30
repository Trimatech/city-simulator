import { Workspace } from "@rbxts/services";
import { store } from "server/store";
import { onPlayerDeath } from "server/world/world.utils";
import { selectSoldierRanking, selectSoldiers, selectSoldiersById } from "shared/store/soldiers";

import { soldierIsInsideChanged } from "../soldiers/soldier-events";
import { applySoldierTerritorySpeed } from "../soldiers/soldiers.utils";
import { getLastIsInsideCheckPosition, invalidateIsInsideCache, setLastIsInsideCheckPosition } from "./collision-cache";
import {
	isCollidingWithEnemyTracers,
	isCollidingWithOwnTracers,
	isCollidingWithSoldier,
	isCollidingWithWall,
	isInsideAnyEnemyPolygon,
	isInsidePolygon,
} from "./collision-tick.utils";

// Only recheck isInside if soldier moved more than this distance
const INSIDE_CHECK_DISTANCE_THRESHOLD = 1;

export function onCollisionTick() {
	// in a head-on collision, the soldier with the lowest area is killed

	const soldiers = store.getState(selectSoldiers);

	for (const soldier of soldiers) {
		if (soldier.dead) {
			// Clean up tracking map for dead soldiers
			invalidateIsInsideCache(soldier.id);
			continue;
		}

		try {
			// This is to prevent hackers claiming areas outside of the map
			if (isCollidingWithWall(soldier)) {
				print(`Collided with wall, kill soldier ${soldier.id}`);
				onPlayerDeath(soldier.id, soldier.id, "wall");
				continue;
			}

			debug.profilebegin("TICK_INSIDE");

			// Spatial optimization: only check isInside if soldier has moved significantly
			// or if we haven't checked yet
			const lastCheckPos = getLastIsInsideCheckPosition(soldier.id);
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
				setLastIsInsideCheckPosition(soldier.id, soldier.position);

				const hasChanged = soldier.isInside !== isInside;
				if (hasChanged) {
					store.setSoldierIsInside(soldier.id, isInside);
					soldierIsInsideChanged.Fire(soldier.id, isInside);
				}

				const inEnemyTerritory = !isInside && isInsideAnyEnemyPolygon(soldier);
				applySoldierTerritorySpeed(soldier.id, isInside, inEnemyTerritory);
			}

			debug.profileend();

			//Check collision with enemy tracers first; give precedence over head-on
			debug.profilebegin("TICK_ENEMY_TRACERS");
			const enemyId = isCollidingWithEnemyTracers(soldier);
			debug.profileend();

			if (enemyId !== undefined) {
				const owner = store.getState(selectSoldiersById)[enemyId];
				if (owner && owner.shieldActiveUntil > Workspace.GetServerTimeNow()) {
					// Collider has shield too — both are protected, no one dies
					if (soldier.shieldActiveUntil > Workspace.GetServerTimeNow()) {
						continue;
					}
					print(`Collided with enemy tracer while owner shielded, kill collider ${soldier.id}`);
					onPlayerDeath(soldier.id, enemyId, "shield-reflect");
					store.incrementSoldierEliminations(enemyId);
					// Shield blocked a death for the tracer owner
					store.setMilestoneShieldBlockedDeath(enemyId);
				} else {
					print(`Collided with enemy tracer, kill owner ${enemyId}`);
					onPlayerDeath(enemyId, soldier.id, "tracer");
					store.incrementSoldierEliminations(soldier.id);
					// Check if the killed player was rank 1 (Giant Slayer)
					const enemyRank = store.getState(selectSoldierRanking(enemyId));
					if (enemyRank === 1) {
						store.setMilestoneGiantSlain(soldier.id);
					}
				}
				continue;
			}

			// Check for collision with own tracers
			debug.profilebegin("TICK_OWN_TRACERS");

			if (!soldier.isInside && isCollidingWithOwnTracers(soldier)) {
				print(`Collided with own tracer, kill soldier ${soldier.id}`);
				onPlayerDeath(soldier.id, soldier.id, "self-tracer");
				continue;
			}
			debug.profileend();

			debug.profilebegin("TICK_ENEMY");
			// Finally, check head-on collision
			const enemy = isCollidingWithSoldier(soldier);
			if (enemy) {
				// Shield protects from head-on kills
				if (enemy.shieldActiveUntil > Workspace.GetServerTimeNow()) {
					debug.profileend();
					continue;
				}
				print(`Collided with enemy, kill soldier ${enemy.id}`);
				onPlayerDeath(enemy.id, soldier.id, "head-on");
				store.incrementSoldierEliminations(soldier.id);
				// Head-on collision badge
				store.setMilestoneHeadOnVictory(soldier.id);
				// Check if the killed player was rank 1 (Giant Slayer)
				const enemyRank = store.getState(selectSoldierRanking(enemy.id));
				if (enemyRank === 1) {
					store.setMilestoneGiantSlain(soldier.id);
				}
			}
			debug.profileend();
		} catch (err) {
			warn(`[Collision] tick failed for soldier ${soldier.id}:`, err);
		}
	}
}

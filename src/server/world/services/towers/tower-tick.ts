import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { takeDamageByPlayerName } from "server/world/world.utils";
import { selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";

const TOWER_ATTACK_INTERVAL = 2; // 3 seconds between attacks

export function onTowerTick() {
	const currentTime = tick();
	const towers = store.getState(selectTowersById);
	const soldiers = store.getState(selectSoldiersById);
	const updates: { id: string; lastAttackTime: number }[] = [];

	for (const [, tower] of Object.entries(towers)) {
		// Skip if tower hasn't cooled down
		if (currentTime - tower.lastAttackTime < TOWER_ATTACK_INTERVAL) {
			continue;
		}

		// Check for enemies in range
		for (const [, soldier] of Object.entries(soldiers)) {
			if (soldier.dead || soldier.id === tower.ownerId) {
				warn(`Skipping tower ${tower.id} because soldier ${soldier.id} is dead or is the owner`);
				//	continue;
			}

			const distance = tower.position.sub(soldier.position).Magnitude;
			if (distance <= tower.range) {
				print(`Tower ${tower.id} attacking soldier ${soldier.id}`);

				// Deal damage to the soldier
				takeDamageByPlayerName(soldier.id, tower.damage);

				// Update tower's last attack time
				updates.push({
					id: tower.id,
					lastAttackTime: currentTime,
				});
				break; // Only attack one soldier per tick
			}
		}
	}

	// Batch update towers' last attack times
	if (updates.size() > 0) {
		for (const update of updates) {
			store.updateTowerLastAttack(update.id, update.lastAttackTime);
		}
	}
}

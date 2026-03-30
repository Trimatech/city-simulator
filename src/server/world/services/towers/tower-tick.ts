import Object from "@rbxts/object-utils";
import { Workspace } from "@rbxts/services";
import { store } from "server/store";
import { onPlayerDeath } from "server/world/world.utils";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { selectSoldiersById } from "shared/store/soldiers";
import { selectTowersById } from "shared/store/towers/tower-selectors";

export function onTowerTick(dt: number) {
	const currentTime = tick();
	const towers = store.getState(selectTowersById);
	const soldiers = store.getState(selectSoldiersById);

	for (const [, tower] of Object.entries(towers)) {
		try {
			// Destroy tower if it's no longer inside the owner's territory
			const owner = soldiers[tower.ownerId];
			if (!owner || owner.polygon.size() === 0) {
				store.removeTower(tower.id);
				continue;
			}

			const polygon = vectorsToPoints(owner.polygon as Vector2[]);
			if (!isPointInPolygon(vector2ToPoint(tower.position), polygon)) {
				store.removeTower(tower.id);
				continue;
			}
			let nearestId: string | undefined = undefined;
			let nearestDist = math.huge;

			for (const [, soldier] of Object.entries(soldiers)) {
				if (!soldier || soldier.dead || soldier.id === tower.ownerId) continue;

				const distance = tower.position.sub(soldier.position).Magnitude;
				if (distance <= tower.shootRange && distance < nearestDist) {
					nearestDist = distance;
					nearestId = soldier.id;
				}
			}

			if (nearestId === undefined) {
				if (tower.currentTargetId !== undefined || tower.hasEnemyInRange !== false) {
					store.updateTowerTarget(tower.id, { hasEnemyInRange: false });
				}
				continue;
			}

			// Apply DPS and update target flags
			store.updateTowerTarget(tower.id, {
				currentTargetId: nearestId,
				hasEnemyInRange: true,
				lastAttackTime: currentTime,
				lastAttackPlayerName: nearestId,
			});

			const target = soldiers[nearestId];
			if (!target || target.dead) continue;
			if (target.shieldActiveUntil > Workspace.GetServerTimeNow()) continue;

			const damage = tower.damage * dt;
			store.decrementSoldierHealth(nearestId, damage);
			store.setMilestoneLastDamageAt(nearestId, Workspace.GetServerTimeNow());

			const updated = store.getState(selectSoldiersById)[nearestId];
			if (updated && updated.health <= 0 && !updated.dead) {
				onPlayerDeath(nearestId, tower.ownerId, "tower");
			}
		} catch (err) {
			warn(`[Tower] tick failed for tower ${tower.id}:`, err);
		}
	}
}

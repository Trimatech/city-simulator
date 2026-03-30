import { store } from "server/store";
import { palette } from "shared/constants/palette";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { isPointInPolygon, vector2ToPoint, vectorsToPoints } from "shared/polybool/poly-utils";
import { remotes } from "shared/remotes";
import { selectSoldierById, selectSoldierOrbs } from "shared/store/soldiers";

const TOWER_PRICE = POWERUP_PRICES.tower;
let id = 0;

interface PlaceTowerOptions {
	skipCost?: boolean;
	position?: Vector2;
}

export function placeTower(playerOrSoldierId: Player | string, options?: PlaceTowerOptions) {
	const player = typeIs(playerOrSoldierId, "Instance") ? (playerOrSoldierId as Player) : undefined;
	const soldierId = player ? player.Name : (playerOrSoldierId as string);
	const skipCost = options?.skipCost ?? false;

	if (!skipCost) {
		const orbCount = store.getState(selectSoldierOrbs(soldierId)) ?? 0;

		if (orbCount < TOWER_PRICE) {
			if (player) {
				remotes.client.alert.fire(player, {
					scope: "money",
					emoji: "🔮",
					message: `Not enough orbs!`,
					color: palette.red,
				});
			}
			return;
		}
	}

	// Check if the player is inside their own territory
	const soldier = store.getState(selectSoldierById(soldierId));
	if (!soldier || !soldier.isInside) {
		if (player) {
			remotes.client.alert.fire(player, {
				scope: "money",
				emoji: "🏗️",
				message: `Can only place towers inside your territory!`,
				color: palette.red,
			});
		}
		return;
	}

	let serverPosition: Vector2;

	if (options?.position) {
		serverPosition = options.position;
	} else {
		if (!player) {
			warn(`Cannot place tower: no position or player provided for ${soldierId}`);
			return;
		}
		// Compute placement in front of the player's character on the server
		const character = player.Character;
		const primaryPart =
			(character?.PrimaryPart as BasePart | undefined) ??
			(character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined);

		if (!primaryPart) {
			warn(`Cannot place tower: missing PrimaryPart for ${player.Name}`);
			return;
		}

		const forwardOffset = primaryPart.CFrame.LookVector.mul(10);
		const targetWorldPosition = primaryPart.Position.add(forwardOffset);
		serverPosition = new Vector2(targetWorldPosition.X, targetWorldPosition.Z);
	}

	// Verify the placement position is also inside the player's territory
	const polygon = vectorsToPoints(soldier.polygon as Vector2[]);
	if (!isPointInPolygon(vector2ToPoint(serverPosition), polygon)) {
		if (player) {
			remotes.client.alert.fire(player, {
				scope: "money",
				emoji: "🏗️",
				message: `Tower placement is outside your territory!`,
				color: palette.red,
			});
		}
		return;
	}

	if (!skipCost) {
		store.decrementSoldierOrbs(soldierId, TOWER_PRICE);
	}

	const towerId = id++;

	store.placeTower({
		id: `${towerId}`,
		position: serverPosition,
		ownerId: soldierId,
		damage: 15,
		shootRange: 100,
		lastAttackTime: 0,
		lastAttackPlayerName: undefined,
		currentTargetId: undefined,
		hasEnemyInRange: false,
	});

	if (player) {
		remotes.client.alert.fire(player, {
			scope: "money",
			emoji: "🔮",
			message: `Tower placed!`,
			color: palette.green,
		});
	}
}

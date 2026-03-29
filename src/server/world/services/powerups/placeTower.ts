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

export function placeTower(player: Player, options?: PlaceTowerOptions) {
	const soldierId = player.Name;
	const skipCost = options?.skipCost ?? false;

	if (!skipCost) {
		const orbCount = store.getState(selectSoldierOrbs(soldierId)) ?? 0;

		if (orbCount < TOWER_PRICE) {
			remotes.client.alert.fire(player, {
				scope: "money",
				emoji: "🔮",
				message: `Not enough orbs!`,
				color: palette.red,
			});
			return;
		}
	}

	// Check if the player is inside their own territory
	const soldier = store.getState(selectSoldierById(soldierId));
	if (!soldier || !soldier.isInside) {
		remotes.client.alert.fire(player, {
			scope: "money",
			emoji: "🏗️",
			message: `Can only place towers inside your territory!`,
			color: palette.red,
		});
		return;
	}

	let serverPosition: Vector2;

	if (options?.position) {
		serverPosition = options.position;
	} else {
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
		remotes.client.alert.fire(player, {
			scope: "money",
			emoji: "🏗️",
			message: `Tower placement is outside your territory!`,
			color: palette.red,
		});
		return;
	}

	if (!skipCost) {
		store.decrementSoldierOrbs(soldierId, TOWER_PRICE);
	}

	const towerId = id++;

	store.placeTower({
		id: `${towerId}`,
		position: serverPosition,
		ownerId: player.Name,
		damage: 15,
		shootRange: 100,
		lastAttackTime: 0,
		lastAttackPlayerName: undefined,
		currentTargetId: undefined,
		hasEnemyInRange: false,
	});

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "🔮",
		message: `Tower placed!`,
		color: palette.green,
	});
}

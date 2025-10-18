import { store } from "server/store";
import { sounds } from "shared/assets";
import { palette } from "shared/constants/palette";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { remotes } from "shared/remotes";
import { selectSoldierOrbs } from "shared/store/soldiers";

const TOWER_PRICE = POWERUP_PRICES.tower;
let id = 0;

export async function placeTower(player: Player) {
	const soldierId = player.Name;
	const orbCount = store.getState(selectSoldierOrbs(soldierId)) ?? 0;

	if (orbCount < TOWER_PRICE) {
		remotes.client.alert.fire(player, {
			scope: "money",
			emoji: "🔮",
			message: `Not enough orbs!`,
			color: palette.red,
			sound: sounds.alert_money,
		});
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
	const serverPosition = new Vector2(targetWorldPosition.X, targetWorldPosition.Z);

	store.decrementSoldierOrbs(soldierId, TOWER_PRICE);

	const towerId = id++;

	store.placeTower({
		id: `${towerId}`,
		position: serverPosition,
		ownerId: player.Name,
		damage: 15,
		range: 50,
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
		sound: sounds.alert_money,
	});
}

import { store } from "server/store";
import { sounds } from "shared/assets";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { selectSoldierOrbs } from "shared/store/soldiers";

const TOWER_PRICE = 100;
let id = 0;

export async function placeTower(player: Player, position: Vector2) {
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

	store.decrementSoldierOrbs(soldierId, TOWER_PRICE);

	const towerId = id++;

	store.placeTower({
		id: `${towerId}`,
		position,
		ownerId: player.Name,
		damage: 15,
		range: 50,
		lastAttackTime: 0,
		lastAttackPlayerName: undefined,
	});

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "🔮",
		message: `Tower placed!`,
		color: palette.green,
		sound: sounds.alert_money,
	});
}

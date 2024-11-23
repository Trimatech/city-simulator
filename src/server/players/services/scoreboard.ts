import { store } from "server/store";
import { selectPlayerBalance } from "shared/store/saves";
import { selectSoldierById } from "shared/store/soldiers";
import { onPlayerAdded, promisePlayerDisconnected } from "shared/utils/player-utils";

export async function initScoreboardService() {
	onPlayerAdded((player) => {
		const stats = new Instance("Folder");
		stats.Name = "leaderstats";
		stats.Parent = player;

		const areaSize = new Instance("IntValue");
		areaSize.Name = "📐 Area Size";
		areaSize.Parent = stats;

		const knockouts = new Instance("IntValue");
		knockouts.Name = "☠️ KOs";
		knockouts.Parent = stats;

		const cash = new Instance("IntValue");
		cash.Name = "💵 Cash";
		cash.Parent = stats;

		const orbs = new Instance("IntValue");
		orbs.Name = "🔵 Orbs";
		orbs.Parent = stats;

		const isPrimary = new Instance("BoolValue");
		isPrimary.Name = "IsPrimary";
		isPrimary.Value = true;
		isPrimary.Parent = areaSize;

		const unsubscribeFromSoldier = store.subscribe(selectSoldierById(player.Name), (soldier) => {
			orbs.Value = soldier ? soldier.orbs : 0;
			areaSize.Value = soldier ? soldier.polygonAreaSize : 0;
			knockouts.Value = soldier ? soldier.eliminations : 0;
		});

		const unsubscribeFromCash = store.subscribe(selectPlayerBalance(player.Name), (balance) => {
			cash.Value = balance ?? 0;
		});

		promisePlayerDisconnected(player).then(() => {
			unsubscribeFromSoldier();
			unsubscribeFromCash();
		});
	});
}

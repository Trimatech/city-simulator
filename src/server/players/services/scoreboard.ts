import { store } from "server/store";
import { selectPlayerBalance } from "shared/store/saves";
import { selectSoldierById } from "shared/store/soldiers";
import { onPlayerAdded, promisePlayerDisconnected } from "shared/utils/player-utils";

export async function initScoreboardService() {
	onPlayerAdded((player) => {
		const stats = new Instance("Folder");
		stats.Name = "leaderstats";
		stats.Parent = player;

		const knockouts = new Instance("IntValue");
		knockouts.Name = "☠️ KOs";
		knockouts.Parent = stats;

		const cash = new Instance("IntValue");
		cash.Name = "💵 Cash";
		cash.Parent = stats;

		const score = new Instance("IntValue");
		score.Name = "💯 Score";
		score.Parent = stats;

		const isPrimary = new Instance("BoolValue");
		isPrimary.Name = "IsPrimary";
		isPrimary.Value = true;
		isPrimary.Parent = score;

		const unsubscribeFromSoldier = store.subscribe(selectSoldierById(player.Name), (soldier) => {
			score.Value = soldier ? soldier.score : 0;
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

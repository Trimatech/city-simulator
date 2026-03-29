import { store } from "server/store";
import { WORLD_BOUNDS } from "shared/constants/core";
import { selectPlayerBalance } from "shared/store/saves";
import { selectSoldierById } from "shared/store/soldiers";
import { onPlayerAdded, promisePlayerDisconnected } from "shared/utils/player-utils";

const WORLD_AREA = math.pi * math.pow(WORLD_BOUNDS, 2);

function formatOwnedPercent(areaSize: number) {
	return `${math.floor((areaSize / WORLD_AREA) * 1000) / 10}%`;
}

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

		const ownedPercent = new Instance("StringValue");
		ownedPercent.Name = "🌎 % Owned";
		ownedPercent.Parent = stats;

		const isPrimary = new Instance("BoolValue");
		isPrimary.Name = "IsPrimary";
		isPrimary.Value = true;
		isPrimary.Parent = areaSize;

		const unsubscribeFromSoldier = store.subscribe(selectSoldierById(player.Name), (soldier) => {
			const claimedAreaSize = soldier ? soldier.polygonAreaSize : 0;
			ownedPercent.Value = formatOwnedPercent(claimedAreaSize);
			areaSize.Value = claimedAreaSize;
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

import { store } from "server/store";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { CRYSTAL_OFFERS } from "shared/constants/shopPrices";
import { remotes } from "shared/remotes";

import { createProduct } from "./process-receipt";

export function initCrystalsService() {
	for (const offer of CRYSTAL_OFFERS) {
		createProduct(offer.productId, (player) => {
			const isPremium = player.MembershipType === Enum.MembershipType.Premium;
			const total = offer.crystals + (isPremium ? offer.bonusCrystals : 0);
			giveCrystals(player, total);
		});
	}
}

function giveCrystals(player: Player, amount: number) {
	print(`[Crystals] Granting ${amount} crystals to ${player.Name}`);
	store.givePlayerCrystals(player.Name, amount);
	print(`[Crystals] Crystals granted to ${player.Name}`);

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "💎",
		message: `Your purchase of <font color="#fff">${amount} crystal${amount === 1 ? "" : "s"}</font> succeeded! Thank you  ❤️`,
		color: palette.blue,
		sound: assets.sounds.alert_money,
	});
}

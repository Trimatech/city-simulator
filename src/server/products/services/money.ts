import { grantMoney } from "server/rewards";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { MONEY_OFFERS } from "shared/constants/shopPrices";
import { remotes } from "shared/remotes";

import { createProduct } from "./process-receipt";

export async function initMoneyService() {
	for (const offer of MONEY_OFFERS) {
		createProduct(offer.productId, (player) => {
			const isPremium = player.MembershipType === Enum.MembershipType.Premium;
			const total = offer.cash + (isPremium ? offer.bonusCash : 0);
			giveMoney(player, total);
		});
	}
}

function giveMoney(player: Player, amount: number) {
	print(`[Money] Granting $${amount} to ${player.Name}`);
	amount = grantMoney(player, amount);
	print(`[Money] After premium bonus: $${amount} for ${player.Name}`);

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "💸",
		message: `Your purchase of <font color="#fff">$${amount}</font> succeeded! Thank you  ❤️`,
		color: palette.green,
		sound: assets.sounds.alert_money,
	});
}

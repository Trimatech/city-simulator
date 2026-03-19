import { grantMoney } from "server/rewards";
import assets from "shared/assets";
import { DevProduct } from "shared/assetsFolder";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

import { createProduct } from "./process-receipt";

export async function initMoneyService() {
	createProduct(DevProduct.MONEY_100, (player) => giveMoney(player, 100 + 10));
	createProduct(DevProduct.MONEY_500, (player) => giveMoney(player, 500 + 100));
	createProduct(DevProduct.MONEY_2500, (player) => giveMoney(player, 2500 + 200));
	createProduct(DevProduct.MONEY_10000, (player) => giveMoney(player, 10000 + 10000));
	createProduct(DevProduct.MONEY_100000, (player) => giveMoney(player, 100000 + 10000));
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

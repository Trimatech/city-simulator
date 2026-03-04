import { grantMoney } from "server/rewards";
import assets from "shared/assets";
import { DevProduct } from "shared/assetsFolder";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

import { createProduct } from "./process-receipt";

export async function initMoneyService() {
	createProduct(DevProduct.MONEY_100, (player) => giveMoney(player, 100));
	createProduct(DevProduct.MONEY_250, (player) => giveMoney(player, 250));
	createProduct(DevProduct.MONEY_500, (player) => giveMoney(player, 500));
	createProduct(DevProduct.MONEY_1000, (player) => giveMoney(player, 1000));
	createProduct(DevProduct.MONEY_5000, (player) => giveMoney(player, 5000));
}

function giveMoney(player: Player, amount: number) {
	amount = grantMoney(player, amount);

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "💸",
		message: `Your purchase of <font color="#fff">$${amount}</font> succeeded! Thank you  ❤️`,
		color: palette.green,
		sound: assets.sounds.alert_money,
	});
}

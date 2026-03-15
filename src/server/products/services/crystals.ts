import { store } from "server/store";
import assets from "shared/assets";
import { DevProduct } from "shared/assetsFolder";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";

import { createProduct } from "./process-receipt";

export function initCrystalsService() {
	createProduct(DevProduct.CRYSTALS_1, (player) => giveCrystals(player, 1));
	createProduct(DevProduct.CRYSTALS_5, (player) => giveCrystals(player, 5 + 1));
	createProduct(DevProduct.CRYSTALS_15, (player) => giveCrystals(player, 15 + 3));
	createProduct(DevProduct.CRYSTALS_25, (player) => giveCrystals(player, 25 + 5));
}

function giveCrystals(player: Player, amount: number) {
	store.givePlayerCrystals(player.Name, amount);

	remotes.client.alert.fire(player, {
		scope: "money",
		emoji: "💎",
		message: `Your purchase of <font color="#fff">${amount} crystal${amount === 1 ? "" : "s"}</font> succeeded! Thank you  ❤️`,
		color: palette.blue,
		sound: assets.sounds.alert_money,
	});
}

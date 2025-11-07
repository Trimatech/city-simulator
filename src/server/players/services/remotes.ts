import { store } from "server/store";
import { sounds } from "shared/assets";
import { palette } from "shared/constants/palette";
import { findSoldierSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { RANDOM_SKIN, selectPlayerBalance, selectPlayerSkins } from "shared/store/saves";

export async function initRemoteService() {
	remotes.save.buySkin.connect((player, skinId) => {
		const skin = findSoldierSkin(skinId);
		const balance = store.getState(selectPlayerBalance(player.Name));

		if (skin && balance !== undefined && balance >= skin.price) {
			store.givePlayerSkin(player.Name, skinId);
			store.givePlayerBalance(player.Name, -skin.price);

			remotes.client.alert.fire(player, {
				emoji: "💵",
				color: palette.green,
				message: `You bought the <font color="#fff">${skin.id}</font> skin for <font color="#fff">$${skin.price}</font>. Thank you!`,
				sound: sounds.alert_money,
			});
		} else {
			remotes.client.alert.fire(player, {
				emoji: "🚨",
				color: palette.red,
				message: `Sorry, you cannot afford the <font color="#fff">${skinId}</font> skin yet.`,
				sound: sounds.alert_bad,
			});
		}
	});

	remotes.save.setSkin.connect((player, skinId) => {
		const skin = findSoldierSkin(skinId);
		const inventory = store.getState(selectPlayerSkins(player.Name));

		if (inventory?.includes(skinId)) {
			store.setPlayerSkin(player.Name, skinId);

			remotes.client.alert.fire(player, {
				emoji: "🌈",
				color: skin?.tint || palette.mauve,
				colorSecondary: skinId === RANDOM_SKIN ? palette.blue : undefined,
				colorMessage: skin?.tint || palette.mauve,
				message:
					skinId === RANDOM_SKIN
						? 'You are now wearing a <font color="#fff">random</font> skin!'
						: `You are now wearing the <font color="#fff">${skinId}</font> skin!`,
			});
		} else {
			remotes.client.alert.fire(player, {
				emoji: "🚨",
				color: palette.red,
				message: `Sorry, you do not own the <font color="#fff">${skinId}</font> skin.`,
				sound: sounds.alert_bad,
			});
		}
	});
}

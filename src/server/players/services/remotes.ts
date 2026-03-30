import { store } from "server/store";
import assets from "shared/assets";
import { allMilestonesComplete } from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import { findSoldierSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { RANDOM_SKIN, selectPlayerBalance, selectPlayerMilestoneProgress, selectPlayerSkins } from "shared/store/saves";

export async function initRemoteService() {
	remotes.save.buySkin.connect((player, skinId) => {
		const skin = findSoldierSkin(skinId);
		const balance = store.getState(selectPlayerBalance(player.Name));

		if (skin && balance !== undefined && balance >= skin.price) {
			store.givePlayerSkin(player.Name, skinId);
			store.givePlayerBalance(player.Name, -skin.price);
			store.setPlayerSkin(player.Name, skinId);

			remotes.client.alert.fire(player, {
				emoji: "💵",
				color: palette.green,
				message: `You bought the <font color="#fff">${skin.id}</font> skin for <font color="#fff">$${skin.price}</font>. Thank you!`,
				sound: assets.sounds.alert_money,
			});
		} else {
			remotes.client.alert.fire(player, {
				emoji: "🚨",
				color: palette.red,
				message: `Sorry, you cannot afford the <font color="#fff">${skinId}</font> skin yet.`,
				sound: assets.sounds.alert_bad,
			});
		}
	});

	remotes.save.setSkin.connect((player, skinId) => {
		const inventory = store.getState(selectPlayerSkins(player.Name));

		if (inventory?.includes(skinId)) {
			store.setPlayerSkin(player.Name, skinId);

			remotes.client.alert.fire(player, {
				emoji: "🌈",
				color: palette.mauve,
				colorSecondary: skinId === RANDOM_SKIN ? palette.blue : undefined,
				colorMessage: palette.mauve,
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
				sound: assets.sounds.alert_bad,
			});
		}
	});

	// Ascension / Prestige
	remotes.save.ascend.connect((player) => {
		const progress = store.getState(selectPlayerMilestoneProgress(player.Name));
		if (!allMilestonesComplete(progress)) {
			remotes.client.alert.fire(player, {
				emoji: "🚨",
				color: palette.red,
				message: "You haven't completed all milestones yet!",
				sound: assets.sounds.alert_bad,
			});
			return;
		}

		store.performAscension(player.Name);

		remotes.client.alert.fire(player, {
			emoji: "⭐",
			color: palette.yellow,
			colorSecondary: palette.peach,
			message: `You have <font color="#fff">Ascended</font>! All milestones reset. Exclusive rewards unlocked.`,
			sound: assets.sounds.alert_money,
		});
	});

	// Handle bird camera position updates for streaming
	remotes.camera.updateBirdPosition.connect((player, position2D) => {
		// Convert 2D position to 3D (bird is at ground level for streaming purposes)
		const position3D = new Vector3(position2D.X, 0, position2D.Y);

		// Request streaming around the bird's position
		player.RequestStreamAroundAsync(position3D);
		print(`Streaming around bird position: ${position2D}`);
	});
}

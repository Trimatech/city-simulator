import { createCollection } from "@rbxts/lapis";
import { Players } from "@rbxts/services";
import { tryGrantBadge } from "server/rewards/services/badges";
import { store } from "server/store";
import { Badge } from "shared/assetsFolder";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";
import { remotes } from "shared/remotes";
import { defaultPlayerSave, playerSaveSchema, selectPlayerSave } from "shared/store/saves";
import { onPlayerAdded, promisePlayerDisconnected } from "shared/utils/player-utils";

const collection = createCollection("players", {
	defaultData: defaultPlayerSave,
	validate: playerSaveSchema,
});

export async function initSaveService() {
	onPlayerAdded(loadPlayerSave);
}

async function loadPlayerSave(player: Player) {
	try {
		const document = await collection.load(`${player.UserId}`);

		if (!player.IsDescendantOf(Players)) {
			print(`player ${player.Name} is not a descendant of Players..........`);
			return document.close();
		}

		const disconnect = store.subscribe(selectPlayerSave(player.Name), (newSave) => {
			if (newSave) {
				print(`saving ${player.Name} with ${newSave}..........`);
				document.write(newSave);
			}
		});

		promisePlayerDisconnected(player).then(() => {
			store.deletePlayerSave(player.Name);
			disconnect();
			document.close();
		});

		const data = document.read();
		print(`loading ${player.Name} with ${data}..........`);
		store.setPlayerSave(player.Name, { ...defaultPlayerSave, ...data });

		// Welcome badge — granted on every join (Roblox only awards it once)
		tryGrantBadge(player.Name, Badge.WELCOME);
	} catch (e) {
		warn(`Failed to load data for ${player.Name}: ${e}`);
		fallbackPlayerSave(player);
	}
}

async function fallbackPlayerSave(player: Player) {
	promisePlayerDisconnected(player).then(() => {
		store.deletePlayerSave(player.Name);
	});

	store.setPlayerSave(player.Name, defaultPlayerSave);

	remotes.client.alert.fire(player, {
		emoji: "🚨",
		color: palette.red,
		message: "Roblox may be having issues with your save data. Sorry for the inconvenience!",
		duration: 10,
		sound: assets.sounds.alert_bad,
	});
}

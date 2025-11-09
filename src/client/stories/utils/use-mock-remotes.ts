import { useEffect } from "@rbxts/react";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { getWallSkin } from "shared/constants/skins";
import { remotes } from "shared/remotes";
import { selectPlayerBalance } from "shared/store/saves";

export function useMockRemotes() {
	useEffect(() => {
		const connections = [
			remotes.soldier.move.test.onFire((position) => {
				store.moveSoldier(USER_NAME, position);
			}),

			remotes.soldier.spawn.test.onFire(() => {
				store.addSoldier(USER_NAME);
			}),

			remotes.save.setSkin.test.onFire((skin) => {
				store.setPlayerSkin(USER_NAME, skin);
			}),

			remotes.save.buySkin.test.onFire((skinId) => {
				const balance = store.getState(selectPlayerBalance(USER_NAME)) ?? 0;
				const skin = getWallSkin(skinId);

				if (balance >= skin.price) {
					store.givePlayerSkin(USER_NAME, skinId);
					store.givePlayerBalance(USER_NAME, -skin.price);
				}
			}),
		];

		return () => {
			connections.forEach((connection) => connection());
		};
	}, []);
}

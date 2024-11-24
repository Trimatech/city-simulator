import { store } from "server/store";
import { killSoldier } from "server/world";
import { defaultPlayerSave } from "shared/store/saves";
import { selectSoldiers } from "shared/store/soldiers";

import { createCommand } from "./create-command";

createCommand("/orbs", (player, argument) => {
	store.patchSoldier(player.Name, { orbs: tonumber(argument) });
});

createCommand("/purge", (player, argument) => {
	let soldiers = store.getState(selectSoldiers).filter((soldier) => {
		return soldier.id !== player.Name;
	});

	if (argument.sub(1, 3) === "bot") {
		soldiers = soldiers.filter((soldier) => soldier.id.sub(1, 3) === "bot");
	}

	for (const soldier of soldiers) {
		killSoldier(soldier.id);
	}
});

createCommand("/money", (player, argument) => {
	store.givePlayerBalance(player.Name, tonumber(argument) ?? 0);
});

createCommand("/force-reset", (player) => {
	store.setPlayerSave(player.Name, defaultPlayerSave);
});

import { store } from "server/store";
import { killSnake } from "server/world";
import { defaultPlayerSave } from "shared/store/saves";
import { selectSnakes } from "shared/store/snakes";

import { createCommand } from "./create-command";

createCommand("/score", (player, argument) => {
	store.patchSnake(player.Name, { score: tonumber(argument) });
});

createCommand("/purge", (player, argument) => {
	let snakes = store.getState(selectSnakes).filter((snake) => {
		return snake.id !== player.Name;
	});

	if (argument.sub(1, 3) === "bot") {
		snakes = snakes.filter((snake) => snake.id.sub(1, 3) === "bot");
	}

	for (const snake of snakes) {
		killSnake(snake.id);
	}
});

createCommand("/money", (player, argument) => {
	store.givePlayerBalance(player.Name, tonumber(argument) ?? 0);
});

createCommand("/force-reset", (player) => {
	store.setPlayerSave(player.Name, defaultPlayerSave);
});

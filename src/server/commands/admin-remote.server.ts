import { Players } from "@rbxts/services";
import { remotes } from "shared/remotes";

import { getCommandHandlers, isPlayerAdmin } from "./create-command";

remotes.admin.executeCommand.connect((player, command, args, target) => {
	if (!isPlayerAdmin(player)) return;

	const alias = `/${command}`;
	const handler = getCommandHandlers().get(alias);
	if (!handler) return;

	let targetPlayer = player;
	if (target !== "") {
		const found = Players.FindFirstChild(target) as Player | undefined;
		if (found && found.IsA("Player")) {
			targetPlayer = found;
		}
	}

	handler(targetPlayer, args);
});

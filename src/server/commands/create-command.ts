import { Players, RunService } from "@rbxts/services";
import { ADMIN_USER_IDS } from "shared/constants/admin";

import { getTextChatCommands } from "./utils";

export type CommandHandler = (player: Player, argument: string) => void;

const commandHandlers = new Map<string, CommandHandler>();

export function getCommandHandlers(): ReadonlyMap<string, CommandHandler> {
	return commandHandlers;
}

export function isPlayerAdmin(player: Player): boolean {
	return ADMIN_USER_IDS.has(player.UserId) || RunService.IsStudio();
}

export async function createCommand(alias: string, handler: CommandHandler) {
	commandHandlers.set(alias, handler);

	const container = await getTextChatCommands();
	const command = new Instance("TextChatCommand");

	command.Triggered.Connect((origin, unfilteredText) => {
		const player = Players.GetPlayerByUserId(origin.UserId);

		if (player && isPlayerAdmin(player)) {
			const argument = unfilteredText.sub(2 + alias.size());
			handler(player, argument);
		}
	});

	command.Name = `GameCommand_${alias}`;
	command.PrimaryAlias = alias;
	command.Parent = container;
}

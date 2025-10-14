const botHumanoidById = new Map<string, Humanoid>();
const botCharacterById = new Map<string, Model>();

export function registerBotCharacter(id: string, character: Model) {
	const humanoid = character.FindFirstChildOfClass("Humanoid");
	if (humanoid) {
		botHumanoidById.set(id, humanoid);
		botCharacterById.set(id, character);
	}
}

export function unregisterBot(id: string) {
	botHumanoidById.delete(id);
	botCharacterById.delete(id);
}

export function getBotHumanoid(id: string): Humanoid | undefined {
	return botHumanoidById.get(id);
}

export function getBotCharacter(id: string): Model | undefined {
	return botCharacterById.get(id);
}

export function listBotIds(): string[] {
	const ids: string[] = [];
	for (const [id] of botCharacterById) ids.push(id);
	return ids;
}

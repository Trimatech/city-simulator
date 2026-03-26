const BOT_NAMES = [
	"Sir Walks-a-Lot",
	"NPC Energy",
	"Lost Tourist",
	"Wandering WiFi",
	"AFK Legend",
	"Error 404",
	"Lag Incarnate",
	"Ctrl+Z",
	"Respawn Speedrun",
	"Oops",
	"Totally Human",
	"Not A Bot",
	"Trust Me Bro",
	"1 FPS Andy",
	"Skill Issue",
	"Free Loot",
	"Noob Prime",
	"Main Character",
	"Plot Armor",
	"Grass Toucher",
	"Certified Gamer",
	"Spawn Camper",
	"RNG Blessed",
	"Panic Builder",
	"Friendly Fire",
	"Accidental W",
	"Aimbot Wish",
	"Nerf Me Pls",
	"Loot Goblin",
	"Snack Break",
];

const usedNames = new Set<string>();

export function getRandomBotName(): string {
	// If all names are used, reset
	if (usedNames.size() >= BOT_NAMES.size()) {
		usedNames.clear();
	}

	const available = BOT_NAMES.filter((n) => !usedNames.has(n));
	const pick = available[math.random(0, available.size() - 1)];
	usedNames.add(pick);
	return `● ${pick} ●`;
}

export function releaseBotName(name: string) {
	usedNames.delete(name);
}

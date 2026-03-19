import { IS_PROD } from "shared/constants/core";

// Badge IDs are assigned by Roblox when mantle creates them.
// After running `mantle deploy`, update these with the real IDs from the mantle state.
// Use: `mantle state get -e <env>` to retrieve assigned badge IDs.

export enum Badge {
	// Territory Milestones
	SETTLER = IS_PROD ? 0 : 0,
	LANDLORD = IS_PROD ? 0 : 0,
	CONQUEROR = IS_PROD ? 0 : 0,
	EMPIRE = IS_PROD ? 0 : 0,
	WORLD_DOMINATOR = IS_PROD ? 0 : 0,

	// Ranking
	PODIUM = IS_PROD ? 0 : 0,
	RUNNER_UP = IS_PROD ? 0 : 0,
	CHAMPION = IS_PROD ? 0 : 0,
	REPEAT_CHAMPION = IS_PROD ? 0 : 0,
	UNDEFEATED = IS_PROD ? 0 : 0,

	// Eliminations
	FIRST_BLOOD = IS_PROD ? 0 : 0,
	BOUNTY_HUNTER = IS_PROD ? 0 : 0,
	EXECUTIONER = IS_PROD ? 0 : 0,
	MASSACRE = IS_PROD ? 0 : 0,
	KILLING_SPREE = IS_PROD ? 0 : 0,
	HEAD_ON_VICTOR = IS_PROD ? 0 : 0,
	GIANT_SLAYER = IS_PROD ? 0 : 0,

	// Powerups
	SPEED_DEMON = IS_PROD ? 0 : 0,
	SHIELDED = IS_PROD ? 0 : 0,
	ARCHITECT = IS_PROD ? 0 : 0,
	LASER_PRECISION = IS_PROD ? 0 : 0,
	NUCLEAR_OPTION = IS_PROD ? 0 : 0,
	ARSENAL = IS_PROD ? 0 : 0,

	// Survival
	SECOND_CHANCE = IS_PROD ? 0 : 0,
	CATS_NINE_LIVES = IS_PROD ? 0 : 0,
	UNTOUCHABLE = IS_PROD ? 0 : 0,
	CLOSE_CALL = IS_PROD ? 0 : 0,

	// Economy & Progression
	WELCOME = IS_PROD ? 0 : 0,
	DEDICATED = IS_PROD ? 0 : 0,
	BIG_SPENDER = IS_PROD ? 0 : 0,
	WEALTHY = IS_PROD ? 0 : 0,
	HIGH_ROLLER = IS_PROD ? 0 : 0,
	FASHIONISTA = IS_PROD ? 0 : 0,

	// Special / Rare
	COLLECTOR = IS_PROD ? 0 : 0,
	TOWER_DESTROYER = IS_PROD ? 0 : 0,
	CLAIMED = IS_PROD ? 0 : 0,
	BOT_BUSTER = IS_PROD ? 0 : 0,
}

import { Badge } from "shared/assetsFolder";
import { MilestoneCategory, WIN_AREA } from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";
import { SharedState } from "shared/store";
import { MilestoneEntity } from "shared/store/milestones";
import { selectPlayerLifetimeStat } from "shared/store/saves";
import { RANDOM_SKIN } from "shared/store/saves/save-types";
import { selectSoldierArea } from "shared/store/soldiers";

type BadgeProgressSelector = (id: string) => (state: SharedState) => number;

export interface BadgeTarget {
	readonly title: string;
	readonly detail: string;
	readonly badge: Badge;
	readonly key: string;
	readonly accent: Color3;
	readonly target: number;
	readonly select: BadgeProgressSelector;
}

export const QUEST_TARGETS = [
	{
		id: "area",
		title: "Claim 25K area",
		target: 25_000,
		emoji: "📐",
		accent: palette.teal,
		accentDark: Color3.fromHex("#015c5c"),
	},
	{
		id: "eliminations",
		title: "Score 1 KO",
		target: 1,
		emoji: "☠️",
		accent: palette.red,
		accentDark: Color3.fromHex("#4e0000"),
	},
	{
		id: "orbs",
		title: "Charge 120 orbs",
		target: 120,
		emoji: "🔮",
		accent: palette.mauve,
		accentDark: Color3.fromHex("#3c1f5c"),
	},
] as const;

// Helper to create milestone selectors
const ms = (field: keyof MilestoneEntity & string): BadgeProgressSelector => {
	return (id) => (state) => {
		const val = state.milestones[id]?.[field];
		if (typeIs(val, "boolean")) return val ? 1 : 0;
		if (typeIs(val, "number")) return val;
		return 0;
	};
};

const msPowerup = (powerupId: string): BadgeProgressSelector => {
	return (id) => (state) => {
		const used = state.milestones[id]?.powerupsUsed;
		return used?.includes(powerupId) ? 1 : 0;
	};
};

const msPowerupCount: BadgeProgressSelector = (id) => (state) => {
	return state.milestones[id]?.powerupsUsed?.size() ?? 0;
};

const msRankReached = (maxRank: number): BadgeProgressSelector => {
	return (id) => (state) => {
		const rank = state.milestones[id]?.topRank ?? 4;
		return rank <= maxRank ? 1 : 0;
	};
};

const saveField = (field: "balance" | "dailyStreak"): BadgeProgressSelector => {
	return (id) => (state) => {
		const save = state.saves[id];
		if (!save) return 0;
		return (save[field] as number) ?? 0;
	};
};

const saveSkinEquipped: BadgeProgressSelector = (id) => (state) => {
	const skin = state.saves[id]?.skin;
	return skin !== undefined && skin !== RANDOM_SKIN ? 1 : 0;
};

const msHasKill: BadgeProgressSelector = (id) => (state) => {
	return (state.milestones[id]?.eliminationCount ?? 0) > 0 ? 1 : 0;
};

const lifetime = (category: "kills" | "area"): BadgeProgressSelector => {
	return (id) => (state) => selectPlayerLifetimeStat(id, category)(state) ?? 0;
};

export const BADGE_TARGETS: readonly BadgeTarget[] = [
	// Territory (lifetime)
	{
		title: "Settler",
		detail: "Claim 100,000 studs² total",
		badge: Badge.SETTLER,
		key: "settler",
		accent: palette.green,
		target: 100_000,
		select: lifetime("area"),
	},
	{
		title: "Landowner",
		detail: "Claim 250,000 studs² total",
		badge: Badge.LANDLORD,
		key: "landlord",
		accent: palette.green,
		target: 250_000,
		select: lifetime("area"),
	},
	{
		title: "Conqueror",
		detail: "Claim 500,000 studs² total",
		badge: Badge.CONQUEROR,
		key: "conqueror",
		accent: palette.green,
		target: 500_000,
		select: lifetime("area"),
	},
	{
		title: "Empire",
		detail: "Claim 1,000,000 studs² total",
		badge: Badge.EMPIRE,
		key: "empire",
		accent: palette.green,
		target: 1_000_000,
		select: lifetime("area"),
	},

	// Eliminations (lifetime)
	{
		title: "First Blood",
		detail: "Eliminate 1 player total",
		badge: Badge.FIRST_BLOOD,
		key: "first-blood",
		accent: palette.red,
		target: 1,
		select: lifetime("kills"),
	},
	{
		title: "Bounty Hunter",
		detail: "Eliminate 10 players total",
		badge: Badge.BOUNTY_HUNTER,
		key: "bounty-hunter",
		accent: palette.red,
		target: 10,
		select: lifetime("kills"),
	},
	{
		title: "Executioner",
		detail: "Eliminate 50 players total",
		badge: Badge.EXECUTIONER,
		key: "executioner",
		accent: palette.red,
		target: 50,
		select: lifetime("kills"),
	},
	{
		title: "Massacre",
		detail: "Eliminate 100 players total",
		badge: Badge.MASSACRE,
		key: "massacre",
		accent: palette.red,
		target: 100,
		select: lifetime("kills"),
	},

	// Ranking
	{
		title: "Podium",
		detail: "Reach rank 3 on the server",
		badge: Badge.PODIUM,
		key: "podium",
		accent: palette.yellow,
		target: 1,
		select: msRankReached(3),
	},
	{
		title: "Runner Up",
		detail: "Reach rank 2 on the server",
		badge: Badge.RUNNER_UP,
		key: "runner-up",
		accent: palette.yellow,
		target: 1,
		select: msRankReached(2),
	},
	{
		title: "Champion",
		detail: "Reach rank 1 on the server",
		badge: Badge.CHAMPION,
		key: "champion",
		accent: palette.yellow,
		target: 1,
		select: msRankReached(1),
	},
	{
		title: "Repeat Champion",
		detail: "Reach rank 1 ten times in one session",
		badge: Badge.REPEAT_CHAMPION,
		key: "repeat-champion",
		accent: palette.yellow,
		target: 10,
		select: ms("rank1Count"),
	},
	{
		title: "Undefeated",
		detail: "Hold rank 1 for 5 minutes straight",
		badge: Badge.UNDEFEATED,
		key: "undefeated",
		accent: palette.yellow,
		target: 1,
		select: msRankReached(1),
	},

	// Eliminations
	{
		title: "Killing Spree",
		detail: "5 eliminations in one life",
		badge: Badge.KILLING_SPREE,
		key: "killing-spree",
		accent: palette.red,
		target: 5,
		select: ms("eliminationCount"),
	},
	{
		title: "Head-On Victor",
		detail: "Win a head-on collision",
		badge: Badge.HEAD_ON_VICTOR,
		key: "head-on-victor",
		accent: palette.red,
		target: 1,
		select: ms("headOnVictory"),
	},
	{
		title: "Giant Slayer",
		detail: "Eliminate the rank 1 player",
		badge: Badge.GIANT_SLAYER,
		key: "giant-slayer",
		accent: palette.red,
		target: 1,
		select: ms("giantSlain"),
	},

	// Powerups
	{
		title: "Speed Demon",
		detail: "Use the Turbo powerup",
		badge: Badge.SPEED_DEMON,
		key: "speed-demon",
		accent: palette.peach,
		target: 1,
		select: msPowerup("turbo"),
	},
	{
		title: "Shielded",
		detail: "Block a fatal hit with Shield",
		badge: Badge.SHIELDED,
		key: "shielded",
		accent: palette.peach,
		target: 1,
		select: ms("shieldBlockedDeath"),
	},
	{
		title: "Architect",
		detail: "Place a Tower",
		badge: Badge.ARCHITECT,
		key: "architect",
		accent: palette.peach,
		target: 1,
		select: msPowerup("tower"),
	},
	{
		title: "Laser Precision",
		detail: "Hit an enemy with Laser Beam",
		badge: Badge.LASER_PRECISION,
		key: "laser-precision",
		accent: palette.peach,
		target: 1,
		select: msPowerup("laserBeam"),
	},
	{
		title: "Nuclear Option",
		detail: "Use the Nuclear Explosion powerup",
		badge: Badge.NUCLEAR_OPTION,
		key: "nuclear-option",
		accent: palette.peach,
		target: 1,
		select: msPowerup("nuclearExplosion"),
	},
	{
		title: "Arsenal",
		detail: "Use all 5 powerups in one life",
		badge: Badge.ARSENAL,
		key: "arsenal",
		accent: palette.peach,
		target: 5,
		select: msPowerupCount,
	},

	// Survival
	{
		title: "Second Chance",
		detail: "Revive once in a session",
		badge: Badge.SECOND_CHANCE,
		key: "second-chance",
		accent: palette.blue,
		target: 1,
		select: ms("reviveCount"),
	},
	{
		title: "Cat's Nine Lives",
		detail: "Revive 9 times in a session",
		badge: Badge.CATS_NINE_LIVES,
		key: "cats-nine-lives",
		accent: palette.blue,
		target: 9,
		select: ms("reviveCount"),
	},
	{
		title: "Untouchable",
		detail: "Survive 5 minutes without taking damage",
		badge: Badge.UNTOUCHABLE,
		key: "untouchable",
		accent: palette.blue,
		target: 1,
		select: msRankReached(4),
	},
	{
		title: "Close Call",
		detail: "Survive at under 10 HP",
		badge: Badge.CLOSE_CALL,
		key: "close-call",
		accent: palette.blue,
		target: 1,
		select: msRankReached(4),
	},

	// Economy & Progression
	{
		title: "Dedicated",
		detail: "Complete a 7-day streak",
		badge: Badge.DEDICATED,
		key: "dedicated",
		accent: palette.blue,
		target: 7,
		select: saveField("dailyStreak"),
	},
	{
		title: "Big Spender",
		detail: "Spend 1,000 orbs on powerups in one life",
		badge: Badge.BIG_SPENDER,
		key: "big-spender",
		accent: palette.green,
		target: 1_000,
		select: ms("orbsSpentOnPowerups"),
	},
	{
		title: "Wealthy",
		detail: "Reach a balance of $50,000",
		badge: Badge.WEALTHY,
		key: "wealthy",
		accent: palette.green,
		target: 50_000,
		select: saveField("balance"),
	},
	{
		title: "High Roller",
		detail: "Reach a balance of $100,000",
		badge: Badge.HIGH_ROLLER,
		key: "high-roller",
		accent: palette.green,
		target: 100_000,
		select: saveField("balance"),
	},
	{
		title: "Fashionista",
		detail: "Equip a non-default skin",
		badge: Badge.FASHIONISTA,
		key: "fashionista",
		accent: palette.pink,
		target: 1,
		select: saveSkinEquipped,
	},

	// Special / Rare
	{
		title: "Collector",
		detail: "Pick up 500 candy in one life",
		badge: Badge.COLLECTOR,
		key: "collector",
		accent: palette.teal,
		target: 500,
		select: ms("candyCollected"),
	},
	{
		title: "Tower Destroyer",
		detail: "Destroy an enemy tower",
		badge: Badge.TOWER_DESTROYER,
		key: "tower-destroyer",
		accent: palette.teal,
		target: 1,
		select: ms("towerDestroyed"),
	},
	{
		title: "Claimed",
		detail: "Earn your first kill bounty",
		badge: Badge.CLAIMED,
		key: "claimed",
		accent: palette.teal,
		target: 1,
		select: msHasKill,
	},
	{
		title: "Bot Buster",
		detail: "Eliminate 10 bots in one life",
		badge: Badge.BOT_BUSTER,
		key: "bot-buster",
		accent: palette.teal,
		target: 10,
		select: ms("botKillCount"),
	},

	// Welcome
	{
		title: "Welcome",
		detail: "Play your first game",
		badge: Badge.WELCOME,
		key: "welcome",
		accent: palette.teal,
		target: 1,
		select: (id) => (state) => (state.saves[id] ? 1 : 0),
	},

	// Territory
	{
		title: "World Dominator",
		detail: "Claim 90% of the map area",
		badge: Badge.WORLD_DOMINATOR,
		key: "world-dominator",
		accent: palette.green,
		target: WIN_AREA,
		select: (id) => (state) => selectSoldierArea(id)(state) ?? 0,
	},
];

export const MILESTONE_EMOJIS: Record<MilestoneCategory, string> = {
	kills: "☠️",
	area: "🗺️",
	orbsEarned: "🔮",
	timeAlive: "⏱️",
	rank1: "👑",
	orbsSpent: "⚡",
	gamesPlayed: "🎮",
};

export const MILESTONE_DARK_ACCENTS: Record<MilestoneCategory, Color3> = {
	kills: Color3.fromHex("#4e1a2a"),
	area: Color3.fromHex("#1b4e20"),
	orbsEarned: Color3.fromHex("#2e1a4e"),
	timeAlive: Color3.fromHex("#1a2e4e"),
	rank1: Color3.fromHex("#4e3c00"),
	orbsSpent: Color3.fromHex("#4e2a10"),
	gamesPlayed: Color3.fromHex("#0e3e3e"),
};

import { Badge } from "shared/assetsFolder";

import { WORLD_BOUNDS } from "./core";

export type MilestoneCategory = "kills" | "area" | "orbsEarned" | "timeAlive" | "rank1" | "orbsSpent" | "gamesPlayed";

export interface MilestoneTier {
	readonly name: string;
	readonly threshold: number;
	readonly cashReward: number;
	readonly crystalReward: number;
	readonly orbReward: number;
	readonly badge?: Badge;
}

export interface MilestoneCategoryDef {
	readonly id: MilestoneCategory;
	readonly label: string;
	readonly icon: string;
	readonly accent: string;
	/** Short action verb for the widget, e.g. "Eliminate" */
	readonly action: string;
	/** Singular unit noun, e.g. "player" */
	readonly unitSingular: string;
	/** Plural unit noun, e.g. "players" */
	readonly unitPlural: string;
	readonly tiers: readonly MilestoneTier[];
}

function tier(name: string, threshold: number, cash: number, crystals = 0, orbs = 0, badge?: Badge): MilestoneTier {
	return { name, threshold, cashReward: cash, crystalReward: crystals, orbReward: orbs, badge };
}

export const MILESTONE_CATEGORIES: readonly MilestoneCategoryDef[] = [
	{
		id: "kills",
		label: "Total Eliminations",
		icon: "skull",
		accent: "#f38ba8",
		action: "Eliminate",
		unitSingular: "player",
		unitPlural: "players",
		tiers: [
			tier("First Strike", 1, 50, 0, 0, Badge.FIRST_BLOOD),
			tier("Fighter", 10, 150, 0, 0, Badge.BOUNTY_HUNTER),
			tier("Warrior", 25, 300, 0, 50),
			tier("Slayer", 50, 500, 0, 0, Badge.EXECUTIONER),
			tier("Destroyer", 100, 1_000, 1, 0, Badge.MASSACRE),
			tier("Annihilator", 250, 2_000),
			tier("Warlord", 500, 3_500, 0, 100),
			tier("Reaper", 1_000, 5_000, 3),
			tier("Apex Predator", 2_500, 8_000),
			tier("Legend of War", 5_000, 15_000, 5),
		],
	},
	{
		id: "area",
		label: "Total Area Claimed",
		icon: "map",
		accent: "#a6e3a1",
		action: "Claim",
		unitSingular: "studs² total",
		unitPlural: "studs² total",
		tiers: [
			tier("Newcomer", 10_000, 50),
			tier("Homesteader", 50_000, 200),
			tier("Settler", 100_000, 350, 0, 0, Badge.SETTLER),
			tier("Landowner", 250_000, 500, 0, 50, Badge.LANDLORD),
			tier("Conqueror", 500_000, 900, 1, 0, Badge.CONQUEROR),
			tier("Baron", 1_000_000, 1_500, 0, 0, Badge.EMPIRE),
			tier("World Dominator", 2_500_000, 2_000, 0, 0, Badge.WORLD_DOMINATOR),
			tier("Duke", 5_000_000, 3_000, 2),
			tier("Sovereign", 15_000_000, 5_000),
			tier("Emperor", 50_000_000, 10_000, 0, 100),
			tier("Continental", 150_000_000, 15_000, 5),
			tier("World Shaper", 500_000_000, 25_000),
			tier("Eternal Domain", 1_000_000_000, 40_000, 10),
		],
	},
	{
		id: "orbsEarned",
		label: "Total Orbs Earned",
		icon: "orb",
		accent: "#cba6f7",
		action: "Collect",
		unitSingular: "orb",
		unitPlural: "orbs",
		tiers: [
			tier("Scavenger", 200, 50, 0, 30),
			tier("Forager", 1_000, 150),
			tier("Harvester", 5_000, 300, 0, 50),
			tier("Hoarder", 15_000, 600, 1),
			tier("Stockpiler", 50_000, 1_500),
			tier("Orb Lord", 150_000, 3_000, 0, 100),
			tier("Energy Baron", 500_000, 6_000, 3),
			tier("Orb Master", 1_000_000, 12_000, 5),
		],
	},
	{
		id: "timeAlive",
		label: "Total Time Alive",
		icon: "clock",
		accent: "#89b4fa",
		action: "Survive",
		unitSingular: "total",
		unitPlural: "total",
		tiers: [
			tier("Survivor", 300, 50),
			tier("Tenacious", 1_800, 200),
			tier("Enduring", 7_200, 500, 0, 50),
			tier("Steadfast", 28_800, 1_500, 2),
			tier("Ironclad", 86_400, 3_000),
			tier("Immortal", 259_200, 6_000, 0, 100),
			tier("Timeless", 720_000, 12_000, 5),
			tier("Eternal", 1_800_000, 20_000, 10),
		],
	},
	{
		id: "rank1",
		label: "Times Reached Rank 1",
		icon: "crown",
		accent: "#f9e2af",
		action: "Reach #1",
		unitSingular: "time",
		unitPlural: "times",
		tiers: [
			tier("Contender", 1, 100, 0, 0, Badge.CHAMPION),
			tier("Victor", 5, 300, 0, 50),
			tier("Dominant", 15, 800, 2),
			tier("Supremacy", 50, 2_000),
			tier("Undisputed", 100, 5_000, 5),
			tier("Goat", 250, 10_000, 0, 100),
		],
	},
	{
		id: "orbsSpent",
		label: "Total Orbs Spent",
		icon: "zap",
		accent: "#fab387",
		action: "Spend",
		unitSingular: "orb on powerups",
		unitPlural: "orbs on powerups",
		tiers: [
			tier("Tactician", 500, 100),
			tier("Strategist", 2_000, 300, 0, 50),
			tier("Commander", 10_000, 1_000, 2),
			tier("General", 50_000, 3_000),
			tier("Mastermind", 200_000, 8_000, 5),
		],
	},
	{
		id: "gamesPlayed",
		label: "Total Games Played",
		icon: "play",
		action: "Play",
		unitSingular: "game",
		unitPlural: "games",
		accent: "#94e2d5",
		tiers: [
			tier("Newcomer", 1, 25, 0, 0, Badge.WELCOME),
			tier("Rookie", 5, 50),
			tier("Regular", 25, 200),
			tier("Dedicated", 100, 500, 1),
			tier("Veteran", 500, 2_000, 3),
			tier("Grinder", 2_000, 5_000, 5),
			tier("Legend", 10_000, 15_000, 10),
		],
	},
] as const;

export const MILESTONE_BY_ID = new Map<MilestoneCategory, MilestoneCategoryDef>();
for (const cat of MILESTONE_CATEGORIES) {
	MILESTONE_BY_ID.set(cat.id, cat);
}

/** Get the next uncompleted tier for a category, or undefined if all complete. */
export function getNextTier(category: MilestoneCategoryDef, completedTier: number): MilestoneTier | undefined {
	if (completedTier >= category.tiers.size()) return undefined;
	return category.tiers[completedTier];
}

/** Get current tier name, or undefined if none completed. */
export function getCurrentTierName(category: MilestoneCategoryDef, completedTier: number): string | undefined {
	if (completedTier <= 0) return undefined;
	return category.tiers[completedTier - 1].name;
}

/** Format a threshold for display, handling time specially. */
export function formatThreshold(category: MilestoneCategoryDef, value: number): string {
	if (category.id === "timeAlive") {
		if (value < 60) return `${value}s`;
		if (value < 3600) return `${math.floor(value / 60)}m`;
		return `${math.floor(value / 3600)}h`;
	}
	if (value >= 1_000_000_000) return `${value / 1_000_000_000}B`;
	if (value >= 1_000_000) return `${value / 1_000_000}M`;
	if (value >= 1_000) return `${value / 1_000}K`;
	return `${value}`;
}

/** Build an action-oriented description like "Eliminate 25 players" */
export function getMilestoneActionText(category: MilestoneCategoryDef, threshold: number): string {
	const amount = formatThreshold(category, threshold);
	const unit = threshold === 1 ? category.unitSingular : category.unitPlural;
	return `${category.action} ${amount} ${unit}`;
}

/** Check if all categories are at max tier. */
export function allMilestonesComplete(progress: MilestoneProgress): boolean {
	for (const cat of MILESTONE_CATEGORIES) {
		if ((progress[cat.id] ?? 0) < cat.tiers.size()) return false;
	}
	return true;
}

export interface MilestoneProgress {
	readonly kills: number;
	readonly area: number;
	readonly orbsEarned: number;
	readonly timeAlive: number;
	readonly rank1: number;
	readonly orbsSpent: number;
	readonly gamesPlayed: number;
}

export const DEFAULT_MILESTONE_PROGRESS: MilestoneProgress = {
	kills: 0,
	area: 0,
	orbsEarned: 0,
	timeAlive: 0,
	rank1: 0,
	orbsSpent: 0,
	gamesPlayed: 0,
};

// Passive orb income from territory ownership
export const MAP_AREA = math.pi * WORLD_BOUNDS * WORLD_BOUNDS;
export const PASSIVE_ORB_INTERVAL = 60; // seconds
export const PASSIVE_ORB_CAP = 35; // max orbs per tick

/** Calculate passive orbs per minute based on area ownership. */
export function getPassiveOrbRate(soldierArea: number): number {
	const mapPercent = (soldierArea / MAP_AREA) * 100;
	return math.min(math.floor(math.sqrt(mapPercent * 100) / 2), PASSIVE_ORB_CAP);
}

// Kill bounty cap
export const KILL_BOUNTY_CAP = 5_000;

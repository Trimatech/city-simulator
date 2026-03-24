import { MilestoneCategory } from "shared/constants/lifetime-milestones";
import { palette } from "shared/constants/palette";

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

export const BADGE_TARGETS = [
	{
		title: "Settler",
		detail: "Reach 100K area in one life",
		target: 100_000,
		emoji: "🗺️",
		accent: palette.green,
		accentDark: Color3.fromHex("#1b4900"),
		key: "area",
	},
	{
		title: "Champion",
		detail: "Take rank 1 on the server",
		target: 1,
		emoji: "👑",
		accent: palette.yellow,
		accentDark: Color3.fromHex("#4e3c00"),
		key: "rank",
	},
	{
		title: "Bounty Hunter",
		detail: "10 eliminations in one life",
		target: 10,
		emoji: "🎯",
		accent: palette.red,
		accentDark: Color3.fromHex("#4e0000"),
		key: "eliminations",
	},
	{
		title: "Dedicated",
		detail: "Complete a 7-day streak",
		target: 7,
		emoji: "🔥",
		accent: palette.blue,
		accentDark: Color3.fromHex("#002f4e"),
		key: "streak",
	},
	{
		title: "Fashionista",
		detail: "Equip a non-default skin",
		target: 1,
		emoji: "🎨",
		accent: palette.pink,
		accentDark: Color3.fromHex("#4e1a3c"),
		key: "fashion",
	},
] as const;

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

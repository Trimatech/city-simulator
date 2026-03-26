import { t } from "@rbxts/t";
import { DEFAULT_MILESTONE_PROGRESS, MilestoneProgress } from "shared/constants/lifetime-milestones";
import { POWERUP_PRICES } from "shared/constants/powerups";
import { freeWallSkins } from "shared/constants/skins";

export interface PlayerSave {
	readonly balance: number;
	readonly crystals: number;
	readonly skins: readonly string[];
	readonly skin: string;
	readonly dailyStreak: number;
	readonly lastDailyRewardClaim: number;

	// Lifetime cumulative stats
	readonly lifetimeKills: number;
	readonly lifetimeAreaClaimed: number;
	readonly lifetimeOrbsEarned: number;
	readonly lifetimeTimeAlive: number;
	readonly lifetimeRank1Count: number;
	readonly lifetimeOrbsSpent: number;
	readonly lifetimeGamesPlayed: number;

	// Highest completed tier per category (0 = none)
	readonly milestoneProgress: MilestoneProgress;

	// Orb rewards pending (applied on next spawn)
	readonly bankedOrbs: number;

	// Prestige
	readonly ascensionLevel: number;
}

export const RANDOM_SKIN = "__random__";

export const defaultPlayerSave: PlayerSave = {
	balance: POWERUP_PRICES.turbo - 5,
	crystals: 33,
	skins: [RANDOM_SKIN, ...freeWallSkins.map((skin) => skin.id)],
	skin: RANDOM_SKIN,
	dailyStreak: 0,
	lastDailyRewardClaim: 0,
	lifetimeKills: 0,
	lifetimeAreaClaimed: 0,
	lifetimeOrbsEarned: 0,
	lifetimeTimeAlive: 0,
	lifetimeRank1Count: 0,
	lifetimeOrbsSpent: 0,
	lifetimeGamesPlayed: 0,
	milestoneProgress: { ...DEFAULT_MILESTONE_PROGRESS },
	bankedOrbs: 0,
	ascensionLevel: 0,
};

// Validate only original fields so old saves without dailyStreak/lastDailyRewardClaim
// still pass Lapis validation. Defaults are filled via { ...defaultPlayerSave, ...data }.
export const playerSaveSchema = t.interface({
	balance: t.number,
	crystals: t.number,
	skins: t.array(t.string),
	skin: t.string,
}) as unknown as t.check<PlayerSave>;

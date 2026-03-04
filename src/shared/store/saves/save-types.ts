import { t } from "@rbxts/t";
import { freeWallSkins } from "shared/constants/skins";

export interface PlayerSave {
	readonly balance: number;
	readonly crystals: number;
	readonly skins: readonly string[];
	readonly skin: string;
	readonly dailyStreak: number;
	readonly lastDailyRewardClaim: number;
}

export const RANDOM_SKIN = "__random__";

export const defaultPlayerSave: PlayerSave = {
	balance: 100,
	crystals: 3,
	skins: [RANDOM_SKIN, ...freeWallSkins.map((skin) => skin.id)],
	skin: RANDOM_SKIN,
	dailyStreak: 0,
	lastDailyRewardClaim: 0,
};

// Validate only original fields so old saves without dailyStreak/lastDailyRewardClaim
// still pass Lapis validation. Defaults are filled via { ...defaultPlayerSave, ...data }.
export const playerSaveSchema = t.interface({
	balance: t.number,
	crystals: t.number,
	skins: t.array(t.string),
	skin: t.string,
) as unknown as t.check<PlayerSave>;

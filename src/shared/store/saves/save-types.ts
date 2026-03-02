import { t } from "@rbxts/t";
import { freeWallSkins } from "shared/constants/skins";

export interface PlayerSave {
	readonly balance: number;
	readonly crystals: number;
	readonly skins: readonly string[];
	readonly skin: string;
}

export const RANDOM_SKIN = "__random__";

export const defaultPlayerSave: PlayerSave = {
	balance: 100,
	crystals: 3,
	skins: [RANDOM_SKIN, ...freeWallSkins.map((skin) => skin.id)],
	skin: RANDOM_SKIN,
};

export const playerSaveSchema: t.check<PlayerSave> = t.interface({
	balance: t.number,
	crystals: t.number,
	skins: t.array(t.string),
	skin: t.string,
});

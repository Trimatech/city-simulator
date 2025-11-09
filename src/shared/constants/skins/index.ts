import { allWallSkins as soldierSkins, freeWallSkins } from "./skins";
import { WallSkin } from "./skins.types";

export * from "./skins";
export * from "./skins.types";

const soldierSkinsById = new Map(soldierSkins.map((skin) => [skin.id, skin]));

export function findSoldierSkin(id: string): WallSkin | undefined {
	return soldierSkinsById.get(id);
}

/**
 * Returns a random default soldier skin.
 */
export function getRandomBaseSoldierSkin(): WallSkin {
	return freeWallSkins[math.random(0, freeWallSkins.size() - 1)];
}

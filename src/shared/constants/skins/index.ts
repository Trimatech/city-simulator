import { baseSoldierSkins, soldierskins as soldierSkins } from "./skins";
import { SoldierSkin } from "./types";

export * from "./skins";
export * from "./types";

const soldierSkinsById = new Map(soldierSkins.map((skin) => [skin.id, skin]));

/**
 * Returns the soldier skin with the given id, or a default skin
 * if the id is invalid.
 */
export function getSoldierSkin(id: string): SoldierSkin {
	return soldierSkinsById.get(id) || baseSoldierSkins[0];
}

export function findSoldierSkin(id: string): SoldierSkin | undefined {
	return soldierSkinsById.get(id);
}

/**
 * Returns a random default soldier skin.
 */
export function getRandomBaseSoldierSkin(): SoldierSkin {
	return baseSoldierSkins[math.random(0, baseSoldierSkins.size() - 1)];
}

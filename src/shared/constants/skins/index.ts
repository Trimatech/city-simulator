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

/**
 * Returns the soldier skin with the given id, or undefined.
 */
export function findSoldierSkin(id: string): SoldierSkin | undefined {
	return soldierSkinsById.get(id);
}

/**
 * Returns the texture and tint of a soldier tracer at this index.
 * Used to apply repeating patterns to the soldier.
 */
export function getSoldierSkinForTracer(
	id: string,
	index: number,
): { readonly texture: string; readonly tint: Color3; readonly boostTint?: Color3 } {
	const { texture, tint, boostTint } = getSoldierSkin(id);

	return {
		texture: texture[index % texture.size()],
		tint: tint[index % tint.size()],
		boostTint: boostTint && boostTint[index % boostTint.size()],
	};
}

export function getSoldierSkinForWallArea(
	id: string,
	index: number,
): { readonly texture: string; readonly tint: Color3; readonly boostTint?: Color3 } {
	const { texture, tint, boostTint } = getSoldierSkin(id);

	return {
		texture: texture[index % texture.size()],
		tint: tint[index % tint.size()],
		boostTint: boostTint && boostTint[index % boostTint.size()],
	};
}

/**
 * Returns a random default soldier skin.
 */
export function getRandomBaseSoldierSkin(): SoldierSkin {
	return baseSoldierSkins[math.random(0, baseSoldierSkins.size() - 1)];
}

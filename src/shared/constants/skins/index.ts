import { allWallSkins as soldierSkins } from "./skins";
import { WallSkin } from "./skins.types";

export * from "./skins";
export * from "./skins.types";

const soldierSkinsById = new Map(soldierSkins.map((skin) => [skin.id, skin]));

export function findSoldierSkin(id: string): WallSkin | undefined {
	return soldierSkinsById.get(id);
}

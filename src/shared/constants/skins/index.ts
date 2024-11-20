import { baseSoldierskins, soldierskins } from "./skins";
import { Soldierskin } from "./types";

export * from "./skins";
export * from "./types";

const soldierskinsById = new Map(soldierskins.map((skin) => [skin.id, skin]));

/**
 * Returns the soldier skin with the given id, or a default skin
 * if the id is invalid.
 */
export function getSoldierskin(id: string): Soldierskin {
	return soldierskinsById.get(id) || baseSoldierskins[0];
}

/**
 * Returns the soldier skin with the given id, or undefined.
 */
export function findSoldierskin(id: string): Soldierskin | undefined {
	return soldierskinsById.get(id);
}

/**
 * Returns the texture and tint of a soldier tracer at this index.
 * Used to apply repeating patterns to the soldier.
 */
export function getSoldierskinForTracer(
	id: string,
	index: number,
): { readonly texture: string; readonly tint: Color3; readonly boostTint?: Color3 } {
	const { texture, tint, boostTint } = getSoldierskin(id);

	return {
		texture: texture[index % texture.size()],
		tint: tint[index % tint.size()],
		boostTint: boostTint && boostTint[index % boostTint.size()],
	};
}

/**
 * Returns a random default soldier skin.
 */
export function getRandomBaseSoldierskin(): Soldierskin {
	return baseSoldierskins[math.random(0, baseSoldierskins.size() - 1)];
}

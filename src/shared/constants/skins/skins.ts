import { accentList, palette } from "../palette";
import { defaultSoldierSkin, SoldierSkin } from "./types";

const catppuccinSoldierSkins: readonly SoldierSkin[] = accentList.map((id) => {
	return {
		...defaultSoldierSkin,
		id,
		tint: palette[id],
	};
});

export const soldierskins: readonly SoldierSkin[] = [
	...catppuccinSoldierSkins,

	{
		...defaultSoldierSkin,
		id: "silver",
		price: 100,
		tint: palette.text,
	},
	// Add GradientWall as a purchasable/equippable skin id
	{
		...defaultSoldierSkin,
		id: "GradientWall",
		price: 0,
		tint: palette.white,
	},
];

export const baseSoldierSkins = soldierskins.filter((skin) => {
	return skin.price === 0;
});

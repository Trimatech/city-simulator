import { accentList, palette } from "../palette";
import { defaultWallSkin, SimpleWallSkin, WallSkin, WallSkinPart } from "./skins.types";

const onlyColorWallSkins: readonly SimpleWallSkin[] = accentList.map((id) => {
	return {
		...defaultWallSkin,
		id,
		tint: palette[id],
	};
});

export const wallPartSkins: readonly WallSkinPart[] = [
	/* Gradient walls */
	{
		id: "CosmicShiftGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/CosmicShiftGradientWall",
		price: 10,
		tint: Color3.fromRGB(38, 19, 213),
	},
	{
		id: "MidNightCityGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/MidNightCityGradientWall",
		price: 10,
		tint: Color3.fromRGB(24, 26, 30),
	},
	{
		id: "BradyFunGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/BradyFunGradientWall",
		price: 10,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "RustafariGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/RustafariGradientWall",
		price: 10,
		tint: Color3.fromRGB(87, 186, 56),
	},
	{
		id: "SweetMorningGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SweetMorningGradientWall",
		price: 10,
		tint: Color3.fromRGB(237, 107, 116),
	},

	{
		id: "JoyShineGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/JoyShineGradientWall",
		price: 10,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "SupermanGradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SupermanGradientWall",
		price: 10,
		tint: Color3.fromRGB(89, 187, 249),
	},

	/* Textured walls */
	{
		id: "StarsWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/StarsWall",
		price: 10,
		tint: Color3.fromRGB(245, 205, 48),
	},
	{
		id: "SpiderwebWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SpiderwebWall",
		price: 10,
		tint: Color3.fromRGB(91, 93, 105),
	},
	{
		id: "FamousWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/FamousWall",
		price: 10,
		tint: Color3.fromRGB(196, 40, 28),
	},
	{
		id: "WoodWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/WoodWall",
		price: 10,
		tint: Color3.fromRGB(81, 62, 26),
	},
	{
		id: "StoneWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/StoneWall",
		price: 10,
		tint: Color3.fromRGB(20, 28, 48),
	},
	{
		id: "IcyWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/IcyWall",
		price: 10,
		tint: Color3.fromRGB(128, 187, 219),
	},
];

export const allWallSkins: readonly WallSkin[] = [...onlyColorWallSkins, ...wallPartSkins];

export const freeWallSkins = allWallSkins.filter((skin) => {
	return skin.price === 0;
});

const wallSkinsById = new Map(wallPartSkins.map((skin) => [skin.id, skin]));

export function getWallSkin(id: string): WallSkin {
	return wallSkinsById.get(id) || freeWallSkins[0];
}

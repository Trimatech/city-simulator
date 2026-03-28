import Object from "@rbxts/object-utils";

import { accents, botAccents, palette } from "../palette";
import { defaultWallSkin, SimpleWallSkin, WallSkin, WallSkinPart } from "./skins.types";

const onlyColorWallSkins: readonly SimpleWallSkin[] = Object.keys(accents).map((id) => {
	return {
		...defaultWallSkin,
		id,
		tint: palette[id],
	};
});

const onlyColorWallSkinsForBots: readonly SimpleWallSkin[] = Object.keys(botAccents).map((id) => {
	return {
		...defaultWallSkin,
		id,
		tint: botAccents[id],
	};
});

export function getRandomBotSkin(): WallSkin {
	return onlyColorWallSkinsForBots[math.random(0, onlyColorWallSkinsForBots.size() - 1)];
}

export const wallPartSkins: readonly WallSkinPart[] = [
	/* Gradient walls */
	{
		id: "CosmicShift",
		type: "part",
		modelName: "CosmicShiftGradientWall",
		price: 3000,
		tint: Color3.fromRGB(38, 19, 213),
	},
	{
		id: "MidNightCity",
		type: "part",
		modelName: "MidNightCityGradientWall",
		price: 4500,
		tint: Color3.fromRGB(24, 26, 30),
	},
	{
		id: "BradyFun",
		type: "part",
		modelName: "BradyFunGradientWall",
		price: 6000,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "Rastafari",
		type: "part",
		modelName: "RastafariGradientWall",
		price: 7500,
		tint: Color3.fromRGB(87, 186, 56),
	},
	{
		id: "SweetMorning",
		type: "part",
		modelName: "SweetMorningGradientWall",
		price: 9000,
		tint: Color3.fromRGB(237, 107, 116),
	},

	{
		id: "JoyShine",
		type: "part",
		modelName: "JoyShineGradientWall",
		price: 10500,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "Superman",
		type: "part",
		modelName: "SupermanGradientWall",
		price: 12000,
		tint: Color3.fromRGB(89, 187, 249),
	},

	/* Textured walls */
	{
		id: "Stars",
		type: "part",
		modelName: "StarsWall",
		price: 17500,
		tint: Color3.fromRGB(245, 205, 48),
	},
	{
		id: "Spiderweb",
		type: "part",
		modelName: "SpiderwebWall",
		price: 22000,
		tint: Color3.fromRGB(91, 93, 105),
	},
	{
		id: "Famous",
		type: "part",
		modelName: "FamousWall",
		price: 27000,
		tint: Color3.fromRGB(196, 40, 28),
	},
	{
		id: "Wood",
		type: "part",
		modelName: "WoodWall",
		price: 32000,
		tint: Color3.fromRGB(81, 62, 26),
	},
	{
		id: "Stone",
		type: "part",
		modelName: "StoneWall",
		price: 40000,
		tint: Color3.fromRGB(20, 28, 48),
	},
	{
		id: "Icy",
		type: "part",
		modelName: "IcyWall",
		price: 50000,
		tint: Color3.fromRGB(128, 187, 219),
	},
];

export const allWallSkins: readonly WallSkin[] = [...onlyColorWallSkins, ...wallPartSkins];

export const freeWallSkins = allWallSkins.filter((skin) => {
	return skin.price === 0;
});

const wallSkinsById = new Map([...allWallSkins, ...onlyColorWallSkinsForBots].map((skin) => [skin.id, skin]));

export function getWallSkin(id: string): WallSkin {
	return wallSkinsById.get(id) || freeWallSkins[0];
}

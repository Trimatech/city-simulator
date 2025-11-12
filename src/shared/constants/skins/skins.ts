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
		modelPath: "ReplicatedStorage/Models/Walls/CosmicShiftGradientWall",
		price: 300,
		tint: Color3.fromRGB(38, 19, 213),
	},
	{
		id: "MidNightCity",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/MidNightCityGradientWall",
		price: 450,
		tint: Color3.fromRGB(24, 26, 30),
	},
	{
		id: "BradyFun",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/BradyFunGradientWall",
		price: 600,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "Rastafari",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/RastafariGradientWall",
		price: 750,
		tint: Color3.fromRGB(87, 186, 56),
	},
	{
		id: "SweetMorning",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SweetMorningGradientWall",
		price: 900,
		tint: Color3.fromRGB(237, 107, 116),
	},

	{
		id: "JoyShine",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/JoyShineGradientWall",
		price: 1050,
		tint: Color3.fromRGB(120, 251, 253),
	},
	{
		id: "Superman",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SupermanGradientWall",
		price: 1200,
		tint: Color3.fromRGB(89, 187, 249),
	},

	/* Textured walls */
	{
		id: "Stars",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/StarsWall",
		price: 1400,
		tint: Color3.fromRGB(245, 205, 48),
	},
	{
		id: "Spiderweb",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/SpiderwebWall",
		price: 1600,
		tint: Color3.fromRGB(91, 93, 105),
	},
	{
		id: "Famous",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/FamousWall",
		price: 1800,
		tint: Color3.fromRGB(196, 40, 28),
	},
	{
		id: "Wood",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/WoodWall",
		price: 2000,
		tint: Color3.fromRGB(81, 62, 26),
	},
	{
		id: "Stone",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/StoneWall",
		price: 2300,
		tint: Color3.fromRGB(20, 28, 48),
	},
	{
		id: "Icy",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/IcyWall",
		price: 2600,
		tint: Color3.fromRGB(128, 187, 219),
	},
];

export const allWallSkins: readonly WallSkin[] = [...onlyColorWallSkins, ...wallPartSkins];

export const freeWallSkins = allWallSkins.filter((skin) => {
	return skin.price === 0;
});

const wallSkinsById = new Map(allWallSkins.map((skin) => [skin.id, skin]));

export function getWallSkin(id: string): WallSkin {
	return wallSkinsById.get(id) || freeWallSkins[0];
}

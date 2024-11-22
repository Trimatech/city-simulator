import { images } from "shared/assets";
import { darken } from "shared/utils/color-utils";

import { accentList, accents, palette } from "../palette";
import { defaultSoldierSkin, SoldierSkin } from "./types";
import { blendColorSequence, duplicate } from "./utils";

const catppuccinSoldierSkins: readonly SoldierSkin[] = accentList.map((id) => {
	return {
		...defaultSoldierSkin,
		id,
		tint: blendColorSequence([accents[id], accents[id].Lerp(palette.black, 0.1)], 12),
	};
});

export const soldierskins: readonly SoldierSkin[] = [
	...catppuccinSoldierSkins,

	{
		...defaultSoldierSkin,
		id: "silver",
		price: 100,
		tint: [palette.text],
	},

	{
		...defaultSoldierSkin,
		id: "usa",
		price: 100,
		tint: [...duplicate([palette.red, palette.offwhite], 4), ...duplicate([palette.white], 8)],
		texture: [...duplicate([images.skins.soldier_main], 8), ...duplicate([images.skins.soldier_stars], 8)],
		boostTint: [...duplicate([palette.red, palette.offwhite], 4), ...duplicate([palette.blue], 8)],
		primary: Color3.fromRGB(59, 77, 138),
		secondary: Color3.fromRGB(43, 57, 105),
	},

	{
		...defaultSoldierSkin,
		id: "canada",
		price: 100,
		tint: [palette.red, palette.white, palette.offwhite],
		texture: [images.skins.soldier_main, images.skins.soldier_canada, images.skins.soldier_main],
		boostTint: [palette.red, palette.red, palette.white],
	},

	{
		...defaultSoldierSkin,
		id: "uk",
		price: 100,
		tint: [palette.red, palette.red, palette.offwhite, palette.blue, palette.blue, palette.offwhite],
	},

	{
		...defaultSoldierSkin,
		id: "france",
		price: 100,
		tint: [
			palette.blue,
			palette.blue,
			palette.offwhite,
			palette.offwhite,
			palette.red,
			palette.red,
			palette.offwhite,
			palette.offwhite,
		],
	},

	{
		...defaultSoldierSkin,
		id: "germany",
		price: 100,
		tint: [palette.surface1, palette.surface1, palette.red, palette.red, palette.yellow, palette.yellow],
	},

	{
		...defaultSoldierSkin,
		id: "japan",
		price: 100,
		tint: [palette.offwhite, palette.offwhite, palette.red],
	},

	{
		...defaultSoldierSkin,
		id: "mexico",
		price: 100,
		tint: [palette.blue, palette.blue, palette.offwhite, palette.offwhite, palette.red, palette.red],
	},

	{
		...defaultSoldierSkin,
		id: "brazil",
		price: 100,
		tint: [palette.green, palette.green, palette.yellow, palette.yellow, palette.blue, palette.blue],
	},

	{
		...defaultSoldierSkin,
		id: "australia",
		price: 100,
		tint: [
			palette.blue,
			palette.blue,
			palette.blue,
			palette.white,
			palette.white,
			palette.offwhite,
			palette.red,
			palette.red,
			palette.offwhite,
		],
		texture: [
			images.skins.soldier_main,
			images.skins.soldier_main,
			images.skins.soldier_main,
			images.skins.soldier_stars,
			images.skins.soldier_stars,
			images.skins.soldier_main,
			images.skins.soldier_main,
			images.skins.soldier_main,
			images.skins.soldier_main,
		],
	},

	{
		...defaultSoldierSkin,
		id: "estonia",
		price: 100,
		tint: [palette.blue, palette.blue, palette.surface1, palette.surface1, palette.offwhite, palette.offwhite],
	},

	{
		...defaultSoldierSkin,
		id: "finland",
		price: 100,
		tint: [palette.offwhite, palette.offwhite, palette.offwhite, palette.blue],
	},

	{
		...defaultSoldierSkin,
		id: "norway",
		price: 100,
		tint: [palette.red, palette.red, palette.offwhite, palette.blue, palette.blue],
	},

	{
		...defaultSoldierSkin,
		id: "denmark",
		price: 100,
		tint: [palette.red, palette.red, palette.offwhite],
	},

	{
		...defaultSoldierSkin,
		id: "sweden",
		price: 100,
		tint: [palette.blue, palette.blue, palette.yellow],
	},

	{
		...defaultSoldierSkin,
		id: "poland",
		price: 100,
		tint: [palette.offwhite, palette.offwhite, palette.red, palette.red],
	},

	{
		...defaultSoldierSkin,
		id: "czech",
		price: 100,
		tint: [
			palette.offwhite,
			palette.offwhite,
			palette.offwhite,
			palette.blue,
			palette.blue,
			palette.red,
			palette.red,
			palette.red,
		],
	},

	{
		...defaultSoldierSkin,
		id: "ukraine",
		price: 100,
		tint: [palette.blue, palette.blue, palette.blue, palette.yellow, palette.yellow, palette.yellow],
	},

	{
		...defaultSoldierSkin,
		id: "hungary",
		price: 100,
		tint: [palette.red, palette.red, palette.offwhite, palette.offwhite, palette.green, palette.green],
	},

	{
		...defaultSoldierSkin,
		id: "south-africa",
		price: 100,
		tint: [
			palette.red,
			palette.red,
			palette.offwhite,
			palette.green,
			palette.green,
			palette.yellow,
			palette.crust,
			palette.crust,
			palette.yellow,
			palette.green,
			palette.green,
			palette.offwhite,
			palette.blue,
			palette.blue,
			palette.offwhite,
		],
	},

	{
		...defaultSoldierSkin,
		id: "pride",
		price: 100,
		tint: [
			Color3.fromHex("#ed5352"),
			Color3.fromHex("#ef8c3d"),
			Color3.fromHex("#f8c654"),
			Color3.fromHex("#7cb788"),
			Color3.fromHex("#4b98cb"),
			Color3.fromHex("#bc59be"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "bi-pride",
		price: 100,
		tint: [
			Color3.fromHex("#ea4689"),
			Color3.fromHex("#ea4689"),
			Color3.fromHex("#ea4689"),
			Color3.fromHex("#b08dfb"),
			Color3.fromHex("#3059bb"),
			Color3.fromHex("#3059bb"),
			Color3.fromHex("#3059bb"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "pan-pride",
		price: 100,
		tint: [
			Color3.fromHex("#ea4689"),
			Color3.fromHex("#ea4689"),
			Color3.fromHex("#f4c757"),
			Color3.fromHex("#f4c757"),
			Color3.fromHex("#60b4ea"),
			Color3.fromHex("#60b4ea"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "lesbian-pride",
		price: 100,
		tint: [
			Color3.fromHex("#e86366"),
			Color3.fromHex("#e58f3f"),
			Color3.fromHex("#e8ba64"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#d2a8cd"),
			Color3.fromHex("#b95bbd"),
			Color3.fromHex("#862b6b"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "ace-pride",
		price: 100,
		tint: [palette.base, Color3.fromHex("#bcb6ba"), Color3.fromHex("#fcfffe"), Color3.fromHex("#b95bbd")],
	},

	{
		...defaultSoldierSkin,
		id: "aro-pride",
		price: 100,
		tint: [
			Color3.fromHex("#78b88b"),
			Color3.fromHex("#a3dbb2"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#bcb6ba"),
			palette.base,
		],
	},

	{
		...defaultSoldierSkin,
		id: "agender-pride",
		price: 100,
		tint: [
			palette.base,
			Color3.fromHex("#bcb6ba"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#78b88b"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#bcb6ba"),
			palette.base,
		],
	},

	{
		...defaultSoldierSkin,
		id: "genderfluid-pride",
		price: 100,
		tint: [
			Color3.fromHex("#e88599"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#b95bbd"),
			palette.base,
			Color3.fromHex("#2c5bbb"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "genderqueer-pride",
		price: 100,
		tint: [
			Color3.fromHex("#b85cb9"),
			Color3.fromHex("#b85cb9"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#79b78a"),
			Color3.fromHex("#79b78a"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "trans-pride",
		price: 100,
		tint: [
			Color3.fromHex("#94c8e5"),
			Color3.fromHex("#f5cfc8"),
			Color3.fromHex("#fcfffe"),
			Color3.fromHex("#f5cfc8"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "nonbinary-pride",
		price: 100,
		tint: [Color3.fromHex("#f4c757"), Color3.fromHex("#fcfffe"), Color3.fromHex("#b95bbd"), palette.base],
	},

	{
		...defaultSoldierSkin,
		id: "intersex-pride",
		price: 100,
		tint: [
			Color3.fromHex("#f6c754"),
			Color3.fromHex("#f6c754"),
			Color3.fromHex("#f6c754"),
			Color3.fromHex("#b95bbd"),
		],
	},

	{
		...defaultSoldierSkin,
		id: "peppermint",
		price: 150,
		tint: [palette.red, palette.red, palette.offwhite, palette.offwhite],
	},

	{
		...defaultSoldierSkin,
		id: "candycorn",
		price: 150,
		tint: [palette.yellow, palette.yellow, palette.peach, palette.peach, palette.offwhite],
	},

	{
		...defaultSoldierSkin,
		id: "zebra",
		price: 250,
		tint: [palette.overlay0, palette.text],
	},

	{
		...defaultSoldierSkin,
		id: "honeybee",
		price: 350,
		tint: [palette.mantle, palette.mantle, palette.yellow],
	},

	{
		...defaultSoldierSkin,
		id: "space-cat",
		price: 450,
		tint: [palette.surface0, palette.offwhite, palette.mauve],
	},

	{
		...defaultSoldierSkin,
		id: "berries-and-cherries",
		price: 750,
		tint: blendColorSequence([palette.red, palette.mauve, palette.blue, palette.mauve], 16),
	},

	{
		...defaultSoldierSkin,
		id: "sunset",
		price: 750,
		tint: blendColorSequence([palette.mauve, palette.red, palette.peach, palette.red], 16),
	},

	{
		...defaultSoldierSkin,
		id: "siamese",
		price: 750,
		tint: blendColorSequence([Color3.fromRGB(99, 74, 61), palette.yellow], 16),
		primary: Color3.fromRGB(125, 94, 76),
		secondary: Color3.fromRGB(92, 69, 56),
	},

	{
		...defaultSoldierSkin,
		id: "stare",
		price: 750,
		tint: blendColorSequence([palette.white, darken(palette.white, 0.25)], 10),
		boostTint: [palette.yellow],
		texture: [images.skins.soldier_stare_body],
		headTexture: images.skins.soldier_stare_head,
		eyeTextureLeft: images.skins.soldier_no_eye,
		eyeTextureRight: images.skins.soldier_no_eye,
		primary: darken(palette.peach, 0.5, 0.5),
		secondary: darken(palette.peach, 0.7, 0.5),
	},

	{
		...defaultSoldierSkin,
		id: "rainbow",
		price: 1000,
		tint: blendColorSequence(
			[
				palette.red,
				palette.peach,
				palette.yellow,
				palette.green,
				palette.teal,
				palette.sky,
				palette.sapphire,
				palette.blue,
				palette.mauve,
			],
			30,
		),
		primary: Color3.fromRGB(186, 51, 84),
		secondary: Color3.fromRGB(217, 97, 125),
	},

	{
		...defaultSoldierSkin,
		id: "watermelon",
		price: 1500,
		tint: blendColorSequence([palette.white, Color3.fromRGB(97, 143, 122)], 12),
		boostTint: [Color3.fromRGB(97, 224, 148)],
		texture: [images.skins.soldier_jelly],
		primary: Color3.fromRGB(70, 140, 102),
		secondary: Color3.fromRGB(54, 117, 68),
	},

	{
		...defaultSoldierSkin,
		id: "red-cherry",
		price: 1500,
		tint: blendColorSequence([palette.white, Color3.fromRGB(140, 97, 110)], 12),
		boostTint: [Color3.fromRGB(232, 107, 130)],
		texture: [images.skins.soldier_jelly_red],
		primary: Color3.fromRGB(135, 48, 71),
		secondary: Color3.fromRGB(112, 38, 51),
	},

	{
		...defaultSoldierSkin,
		id: "blue-raspberry",
		price: 1500,
		tint: blendColorSequence([palette.white, Color3.fromRGB(97, 97, 140)], 12),
		boostTint: [Color3.fromRGB(97, 117, 219)],
		texture: [images.skins.soldier_jelly_blue],
		primary: Color3.fromRGB(51, 64, 140),
		secondary: Color3.fromRGB(38, 38, 112),
	},

	{
		...defaultSoldierSkin,
		id: "black-ice",
		price: 2750,
		tint: [palette.white],
		boostTint: [palette.crust],
		texture: [images.skins.soldier_black_ice],
		primary: palette.mantle,
		secondary: palette.crust,
	},

	{
		...defaultSoldierSkin,
		id: "neon",
		price: 3500,
		tint: blendColorSequence([Color3.fromRGB(186, 51, 84), Color3.fromRGB(94, 41, 153)], 16),
		texture: [images.skins.soldier_outlined],
	},

	{
		...defaultSoldierSkin,
		id: "nightwish",
		price: 3750,
		tint: blendColorSequence([Color3.fromRGB(61, 199, 207), Color3.fromRGB(166, 61, 186), palette.base], 16),
		texture: [images.skins.soldier_outlined],
	},

	{
		...defaultSoldierSkin,
		id: "epic",
		price: 7331,
		tint: [palette.white],
		boostTint: [Color3.fromRGB(224, 179, 89)],
		texture: [images.skins.soldier_awesome_body],
		headTexture: images.skins.soldier_awesome_head,
		eyeTextureLeft: images.skins.soldier_no_eye,
		eyeTextureRight: images.skins.soldier_no_eye,
		primary: palette.surface2,
		secondary: palette.surface0,
	},

	{
		...defaultSoldierSkin,
		id: "devious",
		price: 13337,
		tint: [palette.white],
		boostTint: [Color3.fromRGB(186, 51, 69)],
		texture: [images.skins.soldier_vamp_body],
		headTexture: images.skins.soldier_vamp_head,
		eyeTextureLeft: images.skins.soldier_no_eye,
		eyeTextureRight: images.skins.soldier_no_eye,
		primary: palette.mantle,
		secondary: palette.crust,
	},
];

export const baseSoldierSkins = soldierskins.filter((skin) => {
	return skin.price === 0;
});

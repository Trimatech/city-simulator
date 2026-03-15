import "client/app/react-config";

import Object from "@rbxts/object-utils";
import {
	bubbleRiseConfig,
	confettiConfig,
	downwardsConfig,
	dustStormConfig,
	fireEmbersConfig,
	fireworksConfig,
	leafFallConfig,
	rainfallConfig,
	smokePuffConfig,
	snowfallConfig,
	sparklerConfig,
	spreadConfig,
	waterFountainConfig,
} from "client/ui/Particles/Particles.configs";
import assets from "shared/assets";

export enum ConfigValues {
	Confetti,
	Downwards,
	Spread,
	Rainfall,
	Fireworks,
	Snowfall,
	SmokePuff,
	BubbleRise,
	LeafFall,
	Sparkler,
	WaterFountain,
	DustStorm,
	FireEmbers,
}

export enum ImageValues {
	Crystals1,
	Crystals2,
	Crystals5,
	Crystals15,
	Crystals25,
}

export const configMap = {
	[ConfigValues.Downwards]: downwardsConfig,
	[ConfigValues.Spread]: spreadConfig,
	[ConfigValues.Rainfall]: rainfallConfig,
	[ConfigValues.Fireworks]: fireworksConfig,
	[ConfigValues.Snowfall]: snowfallConfig,
	[ConfigValues.SmokePuff]: smokePuffConfig,
	[ConfigValues.BubbleRise]: bubbleRiseConfig,
	[ConfigValues.LeafFall]: leafFallConfig,
	[ConfigValues.Sparkler]: sparklerConfig,
	[ConfigValues.WaterFountain]: waterFountainConfig,
	[ConfigValues.DustStorm]: dustStormConfig,
	[ConfigValues.FireEmbers]: fireEmbersConfig,
	[ConfigValues.Confetti]: confettiConfig,
};

export const imageMap = {
	[ImageValues.Crystals1]: assets.ui.crystals.crystals_1,
	[ImageValues.Crystals2]: assets.ui.crystals.crystals_2,
	[ImageValues.Crystals5]: assets.ui.crystals.crystals_5,
	[ImageValues.Crystals15]: assets.ui.crystals.crystals_15,
	[ImageValues.Crystals25]: assets.ui.crystals.crystals_25,
};

export type StrNumMap = { [key: string]: number };

export const configTypes: StrNumMap = Object.keys(ConfigValues).reduce((acc: StrNumMap, text) => {
	const nr = ConfigValues[text];
	acc[text] = nr;
	return acc;
}, {});

export const imageTypes: StrNumMap = Object.keys(ImageValues).reduce((acc: StrNumMap, text) => {
	const nr = ImageValues[text];
	acc[text] = nr;
	return acc;
}, {});

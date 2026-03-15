import { DevProduct } from "shared/assetsFolder";

export interface CrystalOffer {
	readonly productId: DevProduct;
	readonly robuxPrice: number;
	readonly crystals: number;
	readonly bonusCrystals: number;
}

export interface MoneyOffer {
	readonly productId: DevProduct;
	readonly robuxPrice: number;
	readonly cash: number;
	readonly bonusCash: number;
}

export const CRYSTAL_OFFERS: CrystalOffer[] = [
	{ productId: DevProduct.CRYSTALS_1, robuxPrice: 10, crystals: 1, bonusCrystals: 0 },
	{ productId: DevProduct.CRYSTALS_5, robuxPrice: 40, crystals: 5, bonusCrystals: 1 },
	{ productId: DevProduct.CRYSTALS_15, robuxPrice: 100, crystals: 15, bonusCrystals: 3 },
	{ productId: DevProduct.CRYSTALS_25, robuxPrice: 200, crystals: 25, bonusCrystals: 5 },
];

export const MONEY_OFFERS: MoneyOffer[] = [
	{ productId: DevProduct.MONEY_100, robuxPrice: 10, cash: 100, bonusCash: 10 },
	{ productId: DevProduct.MONEY_500, robuxPrice: 50, cash: 500, bonusCash: 100 },
	{ productId: DevProduct.MONEY_2500, robuxPrice: 200, cash: 2500, bonusCash: 200 },
	{ productId: DevProduct.MONEY_10000, robuxPrice: 500, cash: 10000, bonusCash: 10000 },
	{ productId: DevProduct.MONEY_100000, robuxPrice: 2000, cash: 100000, bonusCash: 10000 },
];

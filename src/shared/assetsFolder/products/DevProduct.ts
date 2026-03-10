import { IS_PROD } from "shared/constants/core";

export enum DevProduct {
	MONEY_100 = IS_PROD ? 70576095 : 70575137,
	MONEY_250 = IS_PROD ? 70576091 : 70575131,
	MONEY_500 = IS_PROD ? 70576090 : 70575130,
	MONEY_1000 = IS_PROD ? 70576094 : 70575136,
	MONEY_2500 = IS_PROD ? 0 : 0, // TODO: configure product IDs in Roblox developer dashboard
	MONEY_5000 = IS_PROD ? 70576089 : 70575129,
	MONEY_10000 = IS_PROD ? 0 : 0, // TODO: configure product IDs in Roblox developer dashboard
	MONEY_100000 = IS_PROD ? 0 : 0, // TODO: configure product IDs in Roblox developer dashboard
}

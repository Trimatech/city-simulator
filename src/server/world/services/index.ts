import { runOnce } from "shared/utils/run-once";

import { initBotService } from "./bots/bot-saga";
import { initCandyService } from "./candy";
import { initCollisionService } from "./collision";
import { initPowerupService } from "./powerups/powerups.service";
import { initSoldierService } from "./soldiers";
import { initTowerService } from "./towers/tower-saga";

export const initWorldServices = runOnce(async () => {
	initCandyService();
	initCollisionService();
	initSoldierService();
	initTowerService();
	initPowerupService();
	initBotService();
});

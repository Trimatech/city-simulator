import { runOnce } from "shared/utils/run-once";

import { initCandyService } from "./candy";
import { initCollisionService } from "./collision";
import { initSoldierService } from "./soldiers";
import { initTowerService } from "./towers/tower-saga";

export const initWorldServices = runOnce(async () => {
	initCandyService();
	initCollisionService();
	initSoldierService();
	initTowerService();
});

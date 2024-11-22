import { runOnce } from "shared/utils/run-once";

import { initCandyService } from "./candy";
import { initCollisionService } from "./collision";
import { initSoldierService } from "./soldiers";

export const initWorldServices = runOnce(async () => {
	initCandyService();
	initCollisionService();
	initSoldierService();
});

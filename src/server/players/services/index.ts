import { Players } from "@rbxts/services";
import { runOnce } from "shared/utils/run-once";

import { initCharacterService } from "./character";
import { initDailyRewardService } from "./daily-reward";
import { initRemoteService } from "./remotes";
import { initSaveService } from "./save";
import { initScoreboardService } from "./scoreboard";

export const initPlayerServices = runOnce(async () => {
	// Gate character spawning behind the Start button
	Players.CharacterAutoLoads = false;
	initCharacterService();
	initRemoteService();
	initSaveService();
	initScoreboardService();
	initDailyRewardService();
});

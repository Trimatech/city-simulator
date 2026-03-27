import { IS_LOCAL, WORLD_TICK } from "shared/constants/core";
import { CandyType } from "shared/store/candy-grid/candy-types";

// Variable to enable/disable testing stuff, to shorten the work cycle
export const IS_TESTING_STUFF = false;

// The world updates every world tick, which is less than the server's
// heartbeat rate. This means that we can schedule different cycles to run
// on different frames to reduce the load on a single frame.
export const SOLDIER_TICK_PHASE = 0;

export const CANDY_TICK_PHASE = 0.33 * WORLD_TICK;
export const COLLISION_TICK_PHASE = 0.66 * WORLD_TICK;

export const DEFAULT_ORBS = IS_LOCAL ? 400 : 50;

export const CANDY_LIMITS: { readonly [K in CandyType]: number } = {
	[CandyType.Default]: 2048,
	[CandyType.Dropping]: 256,
	[CandyType.Loot]: 256,
};

import { STARTING_FUNDS } from "shared/constants/core";
import { TileMap } from "shared/simulation/tile-map";

/**
 * Per-player city simulation context.
 * Holds the mutable tile map and simulation state that lives outside Reflex.
 */
export class SimContext {
	public readonly tileMap = new TileMap();

	/** Simulation tick counter (for sub-systems that run at different rates) */
	public simTick = 0;

	/** Current simulation speed multiplier: 0 = paused, 1/2/3 = slow/med/fast */
	public speed: SimSpeed = 1;

	/** Whether power grid needs recalculating this tick */
	public powerGridDirty = true;

	constructor(public readonly playerId: number) {}
}

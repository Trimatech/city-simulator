import { MAP_HEIGHT, MAP_WIDTH } from "shared/constants/core";
import { BlockMap } from "shared/simulation/block-map";
import { CensusData, createCensus } from "shared/simulation/census";
import { TileMap } from "shared/simulation/tile-map";
import { createValves, ValveState } from "shared/simulation/valves";
import { BlockMaps } from "shared/simulation/zone-eval";

/**
 * Per-player city simulation context.
 * Holds the mutable tile map, census, valves, and block maps that live outside Reflex.
 */
export class SimContext {
	public readonly tileMap = new TileMap();
	public readonly census: CensusData = createCensus();
	public readonly valves: ValveState = createValves();
	public readonly blockMaps: BlockMaps;

	/** Simulation phase cycle counter (0-15, Micropolis-style 16-phase loop) */
	public phaseCycle = 0;

	/** Simulation cycle counter (wraps at 1024) */
	public simCycle = 0;

	/** City time counter (each unit = ~1/48 of a year) */
	public cityTime = 0;

	/** Current simulation speed multiplier: 0 = paused, 1/2/3 = slow/med/fast */
	public speed: SimSpeed = 1;

	/** Whether power grid needs recalculating this tick */
	public powerGridDirty = true;

	constructor(public readonly playerId: number) {
		this.blockMaps = {
			landValueMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 2),
			pollutionDensityMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 2),
			crimeRateMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 2),
			populationDensityMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 2),
			trafficDensityMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 2),
			rateOfGrowthMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			fireStationMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			fireStationEffectMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			policeStationMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			policeStationEffectMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			cityCentreDistScoreMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 8),
			terrainDensityMap: new BlockMap(MAP_WIDTH, MAP_HEIGHT, 4),
		};
	}
}

import { SharedState } from "shared/store";
import { CandyGridState } from "shared/store/candy-grid/candy-grid-types";
import { SoldiersState } from "shared/store/soldiers";

import { deserializeCandyGrid, serializeCandyGrid } from "./handlers/serdes-candy-grid";
import { deserializeSoldiers, serializeSoldiers } from "./handlers/serdes-soldier";

export interface SharedStateSerialized extends Omit<SharedState, "soldiers" | "candyGrid"> {
	candyGrid?: string;
	soldiers?: string;
}

interface SharedStateForSerdes extends Omit<SharedState, "soldiers" | "candyGrid"> {
	candyGrid?: CandyGridState;
	soldiers?: SoldiersState;
}

// Store the last serialized state to avoid unnecessary re-computations
let lastSerialized: SharedStateSerialized | undefined;
let lastCandyGrid: CandyGridState | undefined;
let lastSoldiers: SoldiersState | undefined;

export function serializeState(state: SharedStateForSerdes, includeCandy = true): SharedStateSerialized {
	if (state.candyGrid === lastCandyGrid && state.soldiers === lastSoldiers) {
		return lastSerialized!;
	}

	const serialized: SharedStateSerialized = {
		...state,
		candyGrid: state.candyGrid && includeCandy ? serializeCandyGrid(state.candyGrid) : undefined,
		soldiers: state.soldiers && serializeSoldiers(state.soldiers),
	};

	lastSerialized = serialized;
	lastCandyGrid = state.candyGrid;
	lastSoldiers = state.soldiers;

	return serialized;
}

export function deserializeState(state: SharedStateSerialized): SharedStateForSerdes {
	return {
		...state,
		candyGrid: state.candyGrid !== undefined ? deserializeCandyGrid(state.candyGrid) : undefined,
		soldiers: state.soldiers !== undefined ? deserializeSoldiers(state.soldiers) : undefined,
	};
}

import { SharedState } from "shared/store";
import { CandyState } from "shared/serdes/handlers/serdes-candy";
import { SoldiersState } from "shared/store/soldiers";

import { deserializeCandy, serializeCandy } from "./handlers/serdes-candy";
import { deserializeSoldiers, serializeSoldiers } from "./handlers/serdes-soldier";

export interface SharedStateSerialized extends Omit<SharedState, "soldiers" | "grid"> {
	candy?: string;
	soldiers?: string;
	//grid?: string;
}

interface SharedStateForSerdes extends Omit<SharedState, "soldiers" | "grid"> {
	candy?: CandyState;
	soldiers?: SoldiersState;
	//grid?: GridState;
}

// Store the last serialized state to avoid unnecessary re-computations
let lastSerialized: SharedStateSerialized | undefined;
let lastCandy: CandyState | undefined;
let lastSoldiers: SoldiersState | undefined;

export function serializeState(state: SharedStateForSerdes, includeCandy = true): SharedStateSerialized {
    if (state.candy === lastCandy && state.soldiers === lastSoldiers) {
		return lastSerialized!;
	}

	const serialized = {
		...state,
		candy: state.candy && includeCandy ? serializeCandy(state.candy) : undefined,
		soldiers: state.soldiers && serializeSoldiers(state.soldiers),
		//grid: state.grid && serializeGrid(state.grid),
	};

	lastSerialized = serialized;
    lastCandy = state.candy;
	lastSoldiers = state.soldiers;

	return serialized;
}

export function deserializeState(state: SharedStateSerialized): SharedStateForSerdes {
	return {
		...state,
		candy: state.candy !== undefined ? deserializeCandy(state.candy) : undefined,
		soldiers: state.soldiers !== undefined ? deserializeSoldiers(state.soldiers) : undefined,
		//grid: state.grid !== undefined ? deserializeGrid(state.grid) : undefined,
	};
}

import { CandyEntity } from "./candy-types";

export interface CandyGridCell {
	readonly [id: string]: CandyEntity | undefined;
}

export interface CandyGridState {
	readonly resolution: number;
	readonly cells: { readonly [cellKey: string]: CandyGridCell | undefined };
}

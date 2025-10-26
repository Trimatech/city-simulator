import { GridState } from "./grid-types";

export const selectGrid = (state: { grid: GridState }) => state.grid;
export const selectGridResolution = (state: { grid: GridState }) => state.grid.resolution;
export const selectGridCells = (state: { grid: GridState }) => state.grid.cells;
export const selectGridCell = (cellKey: string) => (state: { grid: GridState }) => state.grid.cells[cellKey];

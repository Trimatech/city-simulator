import BitBuffer from "@rbxts/bitbuffer2";
import { CandyGridCell, CandyGridState } from "shared/store/candy-grid/candy-grid-types";
import { CandyEntity } from "shared/store/candy-grid/candy-types";
import { countProperties } from "shared/utils/object-utils";

import { readColor3, readVector2, writeColor3, writeVector2 } from "../utils";

export function serializeCandyGrid(state: CandyGridState): string {
	const buffer = new BitBuffer();

	buffer.WriteUInt(16, state.resolution);

	// number of non-empty cells
	let cellsCount = 0;
	for (const [, cell] of pairs(state.cells)) if (cell) cellsCount++;
	buffer.WriteUInt(32, cellsCount);

	for (const [cellKey, cell] of pairs(state.cells)) {
		if (!cell) continue;
		buffer.WriteString(cellKey as string);
		// candies per cell
		buffer.WriteUInt(16, countProperties(cell));
		for (const [, candy] of pairs(cell)) {
			const it = candy as CandyEntity;
			buffer.WriteString(it.id);
			buffer.WriteInt(8, it.type);
			buffer.WriteFloat32(it.size);
			writeVector2(buffer, it.position);
			writeColor3(buffer, it.color);
		}
	}

	return buffer.ToString();
}

export function deserializeCandyGrid(data: string): CandyGridState {
	const buffer = BitBuffer.FromString(data);
	const resolution = buffer.ReadUInt(16);
	const cellsCount = buffer.ReadUInt(32);

	const cells: Record<string, CandyGridCell> = {};
	for (const _ of $range(1, cellsCount)) {
		const cellKey = buffer.ReadString();
		const inCell = buffer.ReadUInt(16);
		const cell: Record<string, CandyEntity> = {};
		for (const _e of $range(1, inCell)) {
			const id = buffer.ReadString();
			cell[id] = {
				id,
				type: buffer.ReadInt(8),
				size: buffer.ReadFloat32(),
				position: readVector2(buffer),
				color: readColor3(buffer),
			};
		}
		cells[cellKey] = cell;
	}

	return { resolution, cells };
}



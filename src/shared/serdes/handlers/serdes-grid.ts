import BitBuffer from "@rbxts/bitbuffer2";
import type { GridCellsByEdgeId, GridLine, GridState } from "shared/store/grid/grid-types";

function writeVector2(buffer: BitBuffer, v: Vector2) {
	buffer.WriteFloat32(v.X);
	buffer.WriteFloat32(v.Y);
}

function readVector2(buffer: BitBuffer) {
	const x = buffer.ReadFloat32();
	const y = buffer.ReadFloat32();
	return new Vector2(x, y);
}

export function serializeGrid(state: GridState): string {
	const buffer = new BitBuffer();
	buffer.WriteUInt(16, state.resolution);

	// number of non-empty cells
	let count = 0;
	for (const [, cell] of pairs(state.cells)) if (cell) count++;
	buffer.WriteUInt(32, count);

	for (const [cellKey, cell] of pairs(state.cells)) {
		if (!cell) continue;
		buffer.WriteString(cellKey as string);
		// edges per cell
		let edges = 0;
		for (const [,] of pairs(cell)) edges++;
		buffer.WriteUInt(16, edges);
		for (const [edgeId, line] of pairs(cell)) {
			const l = line as GridLine;
			buffer.WriteString(edgeId as string);
			buffer.WriteString(l.ownerId);
			buffer.WriteUInt(
				8,
				l.kind === "tracer"
					? 1
					: l.kind === "area"
					? 2
					: 3,
			);
			writeVector2(buffer, l.a);
			writeVector2(buffer, l.b);
		}
	}

	return buffer.ToString();
}

export function deserializeGrid(data: string): GridState {
	const buffer = BitBuffer.FromString(data);
	const resolution = buffer.ReadUInt(16);
	const cellsCount = buffer.ReadUInt(32);

	const cells: Record<string, GridCellsByEdgeId> = {};
	for (const _ of $range(1, cellsCount)) {
		const cellKey = buffer.ReadString();
		const edgeCount = buffer.ReadUInt(16);
		const cell: Record<string, GridLine> = {};
		for (const _e of $range(1, edgeCount)) {
			const edgeId = buffer.ReadString();
			const ownerId = buffer.ReadString();
			const kindByte = buffer.ReadUInt(8);
			const a = readVector2(buffer);
			const b = readVector2(buffer);
			cell[edgeId] = {
				a,
				b,
				ownerId,
				kind: kindByte === 1 ? "tracer" : kindByte === 2 ? "area" : "area2",
			};
		}
		cells[cellKey] = cell;
	}

	return { resolution, cells } as GridState;
}

// Serialize only a single cell's lines map used by setCellLines action
export function serializeCellLines(lines: GridCellsByEdgeId): string {
	const buffer = new BitBuffer();

	// write number of edges in this cell
	let edges = 0;
	for (const [,] of pairs(lines)) edges++;
	buffer.WriteUInt(16, edges);

	for (const [edgeId, line] of pairs(lines)) {
		const l = line as GridLine;
		buffer.WriteString(edgeId as string);
		buffer.WriteString(l.ownerId);
		buffer.WriteUInt(
			8,
			l.kind === "tracer"
				? 1
				: l.kind === "area"
				? 2
				: 3,
		);
		writeVector2(buffer, l.a);
		writeVector2(buffer, l.b);
	}

	return buffer.ToString();
}

export function deserializeCellLines(data: string): GridCellsByEdgeId {
	const buffer = BitBuffer.FromString(data);
	const edgeCount = buffer.ReadUInt(16);

	const cell: Record<string, GridLine> = {};
	for (const _ of $range(1, edgeCount)) {
		const edgeId = buffer.ReadString();
		const ownerId = buffer.ReadString();
		const kindByte = buffer.ReadUInt(8);
		const a = readVector2(buffer);
		const b = readVector2(buffer);
		cell[edgeId] = {
			a,
			b,
			ownerId,
			kind: kindByte === 1 ? "tracer" : kindByte === 2 ? "area" : "area2",
		};
	}

	return cell as GridCellsByEdgeId;
}

import BitBuffer from "@rbxts/bitbuffer2";
import { SoldiersState } from "shared/store/soldiers";
import { countProperties } from "shared/utils/object-utils";

import { readArray, readVector2, writeArray, writeVector2 } from "../utils";

export function serializeSoldiers(state: SoldiersState): string {
	const buffer = new BitBuffer();

	buffer.WriteUInt(16, countProperties(state));

	for (const [, soldier] of pairs(state)) {
		buffer.WriteString(soldier.id);
		buffer.WriteString(soldier.name);
		writeVector2(buffer, soldier.lastPosition);
		writeVector2(buffer, soldier.position);
		buffer.WriteFloat32(soldier.angle);
		buffer.WriteFloat32(soldier.desiredAngle);
		buffer.WriteUInt(32, soldier.score);
		buffer.WriteBool(soldier.boost);
		writeArray(buffer, soldier.tracers, writeVector2);
		writeArray(buffer, soldier.polygon, writeVector2);
		buffer.WriteString(soldier.skin);
		buffer.WriteBool(soldier.dead);
		buffer.WriteUInt(16, soldier.eliminations);
		buffer.WriteBool(soldier.isInside);
		buffer.WriteFloat32(soldier.polygonAreaSize);
	}

	return buffer.ToString();
}

export function deserializeSoldiers(data: string): SoldiersState {
	const state: Writable<SoldiersState> = {};
	const buffer = BitBuffer.FromString(data);
	const size = buffer.ReadUInt(16);

	for (const _ of $range(1, size)) {
		const id = buffer.ReadString();

		state[id] = {
			id,
			name: buffer.ReadString(),
			lastPosition: readVector2(buffer),
			position: readVector2(buffer),
			angle: buffer.ReadFloat32(),
			desiredAngle: buffer.ReadFloat32(),
			score: buffer.ReadUInt(32),
			boost: buffer.ReadBool(),
			tracers: readArray(buffer, readVector2),
			polygon: readArray(buffer, readVector2),
			skin: buffer.ReadString(),
			dead: buffer.ReadBool(),
			eliminations: buffer.ReadUInt(16),
			isInside: buffer.ReadBool(),
			polygonAreaSize: buffer.ReadFloat32(),
		};
	}

	return state;
}

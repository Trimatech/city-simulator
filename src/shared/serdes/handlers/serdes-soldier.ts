import BitBuffer from "@rbxts/bitbuffer2";
import { BoundingBox } from "shared/polybool/poly-utils";
import { SoldiersState } from "shared/store/soldiers";
import { countProperties } from "shared/utils/object-utils";

import { readVector2, writeVector2 } from "../utils";

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
		buffer.WriteUInt(32, soldier.orbs);
		//	writeArray(buffer, soldier.tracers, writeVector2);
		//	writeArray(buffer, soldier.polygon, writeVector2);
		buffer.WriteString(soldier.skin);
		buffer.WriteBool(soldier.dead);
		buffer.WriteUInt(16, soldier.eliminations);
		buffer.WriteBool(soldier.isInside);
		//	buffer.WriteFloat32(soldier.polygonAreaSize);
		buffer.WriteBool(soldier.shieldActive);
		buffer.WriteUInt(16, soldier.health);
		buffer.WriteUInt(16, soldier.maxHealth);
	}

	return buffer.ToString();
}

const defaultPolygonBounds: BoundingBox = { min: new Vector2(), max: new Vector2(), size: new Vector2() };

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
			orbs: buffer.ReadUInt(32),
			tracers: [],
			polygon: [],
			skin: buffer.ReadString(),
			dead: buffer.ReadBool(),
			eliminations: buffer.ReadUInt(16),
			isInside: buffer.ReadBool(),
			polygonAreaSize: 0,
			polygonBounds: defaultPolygonBounds,
			shieldActive: buffer.ReadBool(),
			health: buffer.ReadUInt(16),
			maxHealth: buffer.ReadUInt(16),
		};
	}

	return state;
}

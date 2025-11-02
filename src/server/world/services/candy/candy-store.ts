export interface CandyEntity {
	readonly id: string;
	readonly size: number;
	readonly position: Vector2;
	readonly color: Color3;
	readonly type: number;
	readonly eatenAt?: Vector2;
}

const candyById: { [id: string]: CandyEntity | undefined } = {};

export function getCandy(id: string) {
	return candyById[id];
}

export function addCandy(entity: CandyEntity) {
	candyById[entity.id] = entity;
}

export function setCandyEatenAtLocal(id: string, eatenAt: Vector2) {
	const c = candyById[id];
	if (!c) return;
	candyById[id] = { ...c, eatenAt };
}

export function removeCandyLocal(id: string) {
	candyById[id] = undefined;
}

export function addCandies(entities: CandyEntity[]) {
	for (const e of entities) {
		candyById[e.id] = e;
	}
}

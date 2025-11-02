export interface CandyEntity {
	readonly id: string;
	readonly size: number;
	readonly position: Vector2;
	readonly color: Color3;
	readonly type: CandyType;
	readonly eatenAt?: Vector2;
}

export enum CandyType {
	Default,
	Loot,
	Dropping,
}



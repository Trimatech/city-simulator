export interface WallSkinPart {
	readonly id: string
	readonly type: "part"
	readonly modelPath: string
}

export type WallSkin = WallSkinPart

export const wallSkins: readonly WallSkin[] = [
	{
		id: "GradientWall",
		type: "part",
		modelPath: "ReplicatedStorage/Models/Walls/GradientWall",
	},
]

const wallSkinsById = new Map(wallSkins.map((skin) => [skin.id, skin]))

export function getWallSkin(id: string): WallSkin | undefined {
	return wallSkinsById.get(id)
}



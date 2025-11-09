export interface WallSkinPart {
	readonly id: string;
	readonly price: number;
	readonly tint: Color3; // Need tint for part type for  minimap

	readonly type: "part";
	readonly modelPath: string;
}

export interface SimpleWallSkin {
	readonly id: string;
	readonly price: number;
	readonly tint: Color3;

	readonly type: "tint";
}

export type WallSkin = WallSkinPart | SimpleWallSkin;

export const defaultWallSkin: SimpleWallSkin = {
	id: "default",
	price: 0,
	type: "tint",
	tint: Color3.fromRGB(255, 255, 255),
};

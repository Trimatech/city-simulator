export interface SoldierSkin {
	readonly id: string;
	readonly price: number;
	readonly tint: Color3;
}

export const defaultSoldierSkin: SoldierSkin = {
	id: "default",
	price: 0,
	tint: Color3.fromRGB(255, 255, 255),
};

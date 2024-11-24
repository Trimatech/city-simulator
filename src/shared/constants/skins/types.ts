import { images } from "shared/assets";

export interface SoldierSkin {
	readonly id: string;
	readonly price: number;
	readonly size: Vector2;
	readonly tint: readonly Color3[];
	readonly boostTint?: readonly Color3[];
	readonly texture: readonly string[];
	readonly eyeTextureLeft: string;
	readonly eyeTextureRight: string;
	readonly headTexture?: string;
	readonly headColor?: Color3;
	readonly primary?: Color3;
	readonly secondary?: Color3;
}

export const defaultSoldierSkin: SoldierSkin = {
	id: "default",
	price: 0,
	size: new Vector2(512, 512),
	tint: [Color3.fromRGB(255, 255, 255)],
	texture: [images.skins.soldier_main],
	eyeTextureLeft: images.skins.soldier_eye_left,
	eyeTextureRight: images.skins.soldier_eye_right,
};

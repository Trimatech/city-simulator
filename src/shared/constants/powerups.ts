export const POWERUP_PRICES = {
	turbo: 40,
	shield: 120,
	tower: 100,
	laserBeam: 200,
	nuclearExplosion: 300,
} as const;

export type PowerupId = keyof typeof POWERUP_PRICES;

export const POWERUP_DURATIONS = {
	turbo: 7,
	shield: 10,
} as const;

export interface ExplosionConfig {
	readonly laserBeam: { length: number; width: number; damage: number };
	readonly nuclearExplosion: { radius: number; damage: number };
}

export const POWERUP_EXPLOSIONS: ExplosionConfig = {
	laserBeam: { length: 100, width: 5, damage: 50 },
	nuclearExplosion: { radius: 80, damage: 1000 },
};

export const POWERUP_TURBO_SPEED = 40;

// Colors per powerup for UI usage
import { palette } from "./palette";

export const POWERUP_COLORS: Record<PowerupId, Color3> = {
	turbo: Color3.fromRGB(84, 255, 229), // #54FFE5
	shield: Color3.fromRGB(252, 255, 100), // #FCFF64
	tower: Color3.fromRGB(176, 236, 120), // #B0EC78
	laserBeam: Color3.fromRGB(188, 91, 163), // #BC5BA3
	nuclearExplosion: Color3.fromRGB(251, 85, 87), // #FB5557
};

export interface PowerupButtonStyle {
	readonly backgroundColor: Color3;
	readonly backgroundGradient: ColorSequence;
	readonly borderGradient: ColorSequence;
}

const OUTER_BORDER_COLOR = Color3.fromRGB(14, 42, 78); // #0E2A4E

export const POWERUP_BUTTON_STYLES: Record<PowerupId, PowerupButtonStyle> = {
	nuclearExplosion: {
		backgroundColor: Color3.fromRGB(251, 85, 87),
		backgroundGradient: new ColorSequence(
			Color3.fromRGB(255, 139, 122),
			Color3.fromRGB(201, 62, 69),
		),
		borderGradient: new ColorSequence(
			Color3.fromRGB(255, 160, 160),
			Color3.fromRGB(180, 60, 60),
		),
	},
	laserBeam: {
		backgroundColor: Color3.fromRGB(188, 91, 163),
		backgroundGradient: new ColorSequence(
			Color3.fromRGB(217, 133, 196),
			Color3.fromRGB(143, 62, 124),
		),
		borderGradient: new ColorSequence(
			Color3.fromRGB(230, 150, 210),
			Color3.fromRGB(140, 65, 120),
		),
	},
	shield: {
		backgroundColor: Color3.fromRGB(252, 255, 100),
		backgroundGradient: new ColorSequence(
			Color3.fromRGB(255, 255, 158),
			Color3.fromRGB(201, 204, 60),
		),
		borderGradient: new ColorSequence(
			Color3.fromRGB(255, 255, 180),
			Color3.fromRGB(190, 190, 70),
		),
	},
	tower: {
		backgroundColor: Color3.fromRGB(176, 236, 120),
		backgroundGradient: new ColorSequence(
			Color3.fromRGB(208, 255, 158),
			Color3.fromRGB(127, 181, 78),
		),
		borderGradient: new ColorSequence(
			Color3.fromRGB(210, 255, 170),
			Color3.fromRGB(130, 175, 85),
		),
	},
	turbo: {
		backgroundColor: Color3.fromRGB(84, 255, 229),
		backgroundGradient: new ColorSequence(
			Color3.fromRGB(141, 255, 240),
			Color3.fromRGB(43, 201, 179),
		),
		borderGradient: new ColorSequence(
			Color3.fromRGB(150, 255, 240),
			Color3.fromRGB(60, 190, 170),
		),
	},
};

export { OUTER_BORDER_COLOR as POWERUP_OUTER_BORDER_COLOR };

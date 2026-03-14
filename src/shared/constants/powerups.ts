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

export const POWERUP_COLORS: Record<PowerupId, Color3> = {
	turbo: Color3.fromRGB(0, 163, 138), // #54FFE5
	shield: Color3.fromRGB(168, 171, 0), // #FCFF64
	tower: Color3.fromRGB(94, 191, 5), // #B0EC78
	laserBeam: Color3.fromRGB(161, 0, 181), // #BC5BA3
	nuclearExplosion: Color3.fromRGB(186, 0, 3), // #FB5557
};

export interface PowerupButtonStyle {
	readonly backgroundColor: Color3;
	readonly backgroundGradient: ColorSequence;
	readonly borderGradient: ColorSequence;
}

const OUTER_BORDER_COLOR = Color3.fromRGB(14, 42, 78); // #0E2A4E

export const POWERUP_BUTTON_STYLES: Record<PowerupId, PowerupButtonStyle> = {
	nuclearExplosion: {
		backgroundColor: POWERUP_COLORS.nuclearExplosion,
		backgroundGradient: new ColorSequence(Color3.fromHex("#FF6264"), Color3.fromHex("#E33E40")),
		borderGradient: new ColorSequence(Color3.fromRGB(255, 160, 160), Color3.fromRGB(180, 60, 60)),
	},
	laserBeam: {
		backgroundColor: POWERUP_COLORS.laserBeam,
		backgroundGradient: new ColorSequence(Color3.fromHex("#AC4B93"), Color3.fromHex("#AC4B93")),
		borderGradient: new ColorSequence(Color3.fromRGB(230, 150, 210), Color3.fromRGB(140, 65, 120)),
	},
	shield: {
		backgroundColor: POWERUP_COLORS.shield,
		backgroundGradient: new ColorSequence(Color3.fromHex("#9A9D03"), Color3.fromHex("#7D8000")),
		borderGradient: new ColorSequence(Color3.fromRGB(255, 255, 180), Color3.fromRGB(190, 190, 70)),
	},
	tower: {
		backgroundColor: POWERUP_COLORS.tower,
		backgroundGradient: new ColorSequence(Color3.fromHex("#6EAA36"), Color3.fromHex("#538F1B")),
		borderGradient: new ColorSequence(Color3.fromRGB(210, 255, 170), Color3.fromRGB(130, 175, 85)),
	},
	turbo: {
		backgroundColor: POWERUP_COLORS.turbo,
		backgroundGradient: new ColorSequence(Color3.fromHex("#19C4AA"), Color3.fromHex("#00A58C")),
		borderGradient: new ColorSequence(Color3.fromRGB(150, 255, 240), Color3.fromRGB(60, 190, 170)),
	},
};

export { OUTER_BORDER_COLOR as POWERUP_OUTER_BORDER_COLOR };

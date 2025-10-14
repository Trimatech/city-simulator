export interface PowerupPrices {
	readonly turbo: number;
	readonly turbo2x: number;
	readonly shield: number;
	readonly tower: number;
	readonly laserBeam: number;
	readonly nuclearExplosion: number;
}

export type PowerupId = keyof PowerupPrices;

export const POWERUP_PRICES: PowerupPrices = {
	turbo: 40,
	turbo2x: 80,
	shield: 120,
	tower: 100,
	laserBeam: 200,
	nuclearExplosion: 300,
};

export interface PowerupDurations {
	readonly turbo: number;
	readonly turbo2x: number;
	readonly shield: number;
}

export const POWERUP_DURATIONS: PowerupDurations = {
	turbo: 5,
	turbo2x: 5,
	shield: 10,
};

export interface ExplosionConfig {
	readonly laserBeam: { length: number; width: number; damage: number };
	readonly nuclearExplosion: { radius: number; damage: number };
}

export const POWERUP_EXPLOSIONS: ExplosionConfig = {
	laserBeam: { length: 100, width: 5, damage: 50 },
	nuclearExplosion: { radius: 80, damage: 1000 },
};

export interface TurboSpeeds {
	readonly turbo: number;
	readonly turbo2x: number;
}

export const POWERUP_TURBO_SPEEDS: TurboSpeeds = {
	turbo: 34,
	turbo2x: 48,
};

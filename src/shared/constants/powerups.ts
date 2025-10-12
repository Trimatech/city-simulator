export interface PowerupPrices {
	readonly turbo: number;
	readonly turbo2x: number;
	readonly shield: number;
	readonly tower: number;
	readonly explosion: number;
	readonly megaExplosion: number;
}

export type PowerupId = keyof PowerupPrices;

export const POWERUP_PRICES: PowerupPrices = {
	turbo: 40,
	turbo2x: 80,
	shield: 120,
	tower: 100,
	explosion: 150,
	megaExplosion: 300,
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
	readonly explosion: { radius: number; damage: number };
	readonly megaExplosion: { radius: number; damage: number };
}

export const POWERUP_EXPLOSIONS: ExplosionConfig = {
	explosion: { radius: 60, damage: 35 },
	megaExplosion: { radius: 110, damage: 1000 },
};

export interface TurboSpeeds {
	readonly turbo: number;
	readonly turbo2x: number;
}

export const POWERUP_TURBO_SPEEDS: TurboSpeeds = {
	turbo: 34,
	turbo2x: 48,
};

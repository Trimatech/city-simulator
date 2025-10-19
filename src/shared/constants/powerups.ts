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
	// Choose complementary hues to make the emoji stand out
	turbo: palette.blue, // deeper blue complements ⚡ (orange/yellow)
	shield: palette.peach, // complements 🛡️ (blue)
	tower: palette.sky, // complements 🗼 (red)
	laserBeam: palette.pink, // complements 🔫 (green)
	nuclearExplosion: palette.mauve, // complements ☢️ (yellow)
};

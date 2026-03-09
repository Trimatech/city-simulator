import { POWERUP_COLORS, POWERUP_PRICES } from "shared/constants/powerups";

export function getGlowColor(orbs: number | undefined): Color3 | undefined {
	if (orbs === undefined) return undefined;
	if (orbs >= POWERUP_PRICES.nuclearExplosion) return POWERUP_COLORS.nuclearExplosion;
	if (orbs >= POWERUP_PRICES.laserBeam) return POWERUP_COLORS.laserBeam;
	return undefined;
}

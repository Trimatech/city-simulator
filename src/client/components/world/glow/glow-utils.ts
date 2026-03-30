import { SOLDIER_MAX_ORBS } from "shared/constants/core";
import { POWERUP_COLORS, POWERUP_PRICES } from "shared/constants/powerups";

const DEFAULT_GLOW_COLOR = Color3.fromRGB(255, 255, 255);

const MIN_OUTLINE_TRANSPARENCY = 0;
const MAX_OUTLINE_TRANSPARENCY = 0.85;

export function getGlowColor(orbs: number | undefined): Color3 {
	if (orbs !== undefined && orbs >= POWERUP_PRICES.nuke) return POWERUP_COLORS.nuke;
	if (orbs !== undefined && orbs >= POWERUP_PRICES.laserBeam) return POWERUP_COLORS.laserBeam;
	return DEFAULT_GLOW_COLOR;
}

export function getGlowOutlineTransparency(orbs: number | undefined): number {
	if (orbs === undefined || orbs <= 0) return MAX_OUTLINE_TRANSPARENCY;
	const t = math.clamp(orbs / SOLDIER_MAX_ORBS, 0, 1);
	return MAX_OUTLINE_TRANSPARENCY - t * (MAX_OUTLINE_TRANSPARENCY - MIN_OUTLINE_TRANSPARENCY);
}

import { TweenService } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { remotes } from "shared/remotes";

import { cleanupEffects, createCarpetBombExplosionWithCFrame, createNuclearExplosion } from "./ExplosionUtils";

const EXPLOSION_DURATION = 2;
const FADE_DURATION = 1.5;
const NUCLEAR_FADE_DURATION = 4;

function handleCarpetExplosion(cframe: CFrame, size: Vector3) {
	const center = new Vector2(cframe.Position.X, cframe.Position.Z);
	const effects = createCarpetBombExplosionWithCFrame(center, size, cframe);

	const root = effects[0];
	if (root) {
		playSound(assets.sounds.laser3, { volume: 1, parent: root });
		const fadeTween = TweenService.Create(
			root,
			new TweenInfo(FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ Transparency: 1 },
		);
		fadeTween.Play();
	}

	cleanupEffects(effects, EXPLOSION_DURATION + FADE_DURATION);
}

function handleNuclearExplosion(cframe: CFrame, size: Vector3) {
	const center = new Vector2(cframe.Position.X, cframe.Position.Z);
	const effects = createNuclearExplosion(center, size);

	const root = effects[0];
	if (root) {
		playSound(assets.sounds.explosion_effect, { volume: 1, parent: root });
		const fadeTween = TweenService.Create(
			root,
			new TweenInfo(NUCLEAR_FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ Transparency: 1 },
		);
		fadeTween.Play();
	}

	cleanupEffects(effects, EXPLOSION_DURATION + NUCLEAR_FADE_DURATION);
}

export function initializeExplosionEffects() {
	const disconnectCarpet = remotes.client.powerupCarpet.connect(handleCarpetExplosion);
	const disconnectNuclear = remotes.client.powerupNuclear.connect(handleNuclearExplosion);

	return () => {
		disconnectCarpet();
		disconnectNuclear();
	};
}

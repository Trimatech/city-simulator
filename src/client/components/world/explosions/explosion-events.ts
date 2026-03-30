import { TweenService } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { remotes } from "shared/remotes";

import { cleanupEffects, createCarpetBombExplosionWithCFrame, createNukeExplosion } from "./ExplosionUtils";

const EXPLOSION_DURATION = 2;
const FADE_DURATION = 1.5;
const NUKE_FADE_DURATION = 4;

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

function handleNukeExplosion(cframe: CFrame, size: Vector3) {
	const center = new Vector2(cframe.Position.X, cframe.Position.Z);
	const effects = createNukeExplosion(center, size);

	const root = effects[0];
	if (root) {
		playSound(assets.sounds.explosion_effect, { volume: 1, parent: root });
		const fadeTween = TweenService.Create(
			root,
			new TweenInfo(NUKE_FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ Transparency: 1 },
		);
		fadeTween.Play();
	}

	cleanupEffects(effects, EXPLOSION_DURATION + NUKE_FADE_DURATION);
}

export function initializeExplosionEffects() {
	const disconnectCarpet = remotes.client.powerupCarpet.connect(handleCarpetExplosion);
	const disconnectNuke = remotes.client.powerupNuke.connect(handleNukeExplosion);

	return () => {
		disconnectCarpet();
		disconnectNuke();
	};
}

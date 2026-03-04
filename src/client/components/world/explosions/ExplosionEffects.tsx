import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import assets from "shared/assets";
import { playSound } from "shared/assetsFolder";
import { remotes } from "shared/remotes";

import { cleanupEffects, createCarpetBombExplosionWithCFrame, createNuclearExplosion } from "./ExplosionUtils";

const EXPLOSION_DURATION = 2;
const FADE_DURATION = 1.5;
const NUCLEAR_FADE_DURATION = 4;

export function ExplosionEffects() {
	const effectsRef = useRef<Part[]>([]);

	useEffect(() => {
		const cleanupCarpet = remotes.client.powerupCarpet.connect((cframe, size) => {
			effectsRef.current.forEach((effect) => {
				if (effect && effect.IsDescendantOf(game)) effect.Destroy();
			});

			const center = new Vector2(cframe.Position.X, cframe.Position.Z);
			const effects = createCarpetBombExplosionWithCFrame(center, size, cframe);
			if (effects[0]) {
				playSound(assets.sounds.laser3, { volume: 1, parent: effects[0] });
				const fadeTween = TweenService.Create(
					effects[0],
					new TweenInfo(FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
					{ Transparency: 1 },
				);
				fadeTween.Play();
			}
			cleanupEffects(effects, EXPLOSION_DURATION + FADE_DURATION);
			effectsRef.current = effects;
		});

		const cleanupNuclear = remotes.client.powerupNuclear.connect((cframe, size) => {
			effectsRef.current.forEach((effect) => {
				if (effect && effect.IsDescendantOf(game)) effect.Destroy();
			});

			const center = new Vector2(cframe.Position.X, cframe.Position.Z);
			const effects = createNuclearExplosion(center, size);
			if (effects[0]) {
				playSound(assets.sounds.explosion_effect, { volume: 1, parent: effects[0] });
				const fadeTween = TweenService.Create(
					effects[0],
					new TweenInfo(NUCLEAR_FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
					{ Transparency: 1 },
				);
				fadeTween.Play();
			}
			cleanupEffects(effects, EXPLOSION_DURATION + NUCLEAR_FADE_DURATION);
			effectsRef.current = effects;
		});

		return () => {
			cleanupCarpet();
			cleanupNuclear();
			effectsRef.current.forEach((effect) => {
				if (effect && effect.IsDescendantOf(game)) effect.Destroy();
			});
		};
	}, []);

	return <></>;
}

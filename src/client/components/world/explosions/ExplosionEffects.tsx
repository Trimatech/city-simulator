import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { remotes } from "shared/remotes";

import { cleanupEffects, createCarpetBombExplosionWithCFrame, createNuclearExplosion } from "./ExplosionUtils";

interface ExplosionEffectProps {
	explosionType: "carpetBomb" | "nuclear";
	center: Vector2;
	cframe?: CFrame;
	size?: Vector2;
	radius?: number;
}

const EXPLOSION_DURATION = 2;
const FADE_DURATION = 1.5;

function createExplosionEffect({ explosionType, center, cframe, size, radius }: ExplosionEffectProps) {
	let effects: Part[] = [];

	if (explosionType === "carpetBomb" && size !== undefined && cframe !== undefined) {
		print(`[DEBUG] Creating carpet bomb explosion: center=${center}, size=${size}, cframe=${cframe}`);
		effects = createCarpetBombExplosionWithCFrame(center, size.X, size.Y, cframe);
		print(`[DEBUG] Created ${effects.size()} explosion effects`);
	} else if (explosionType === "nuclear" && radius) {
		effects = createNuclearExplosion(center, radius);
	}

	// Fade out main effect
	if (effects[0]) {
		const fadeTween = TweenService.Create(
			effects[0],
			new TweenInfo(FADE_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
			{ Transparency: 1 },
		);
		fadeTween.Play();
	}

	// Cleanup after animation
	cleanupEffects(effects, EXPLOSION_DURATION + FADE_DURATION);

	return effects;
}

export function ExplosionEffects() {
	const effectsRef = useRef<Part[]>([]);

	useEffect(() => {
		const cleanup = remotes.client.powerupExplosion.connect((params) => {
			// Clean up previous effects
			effectsRef.current.forEach((effect) => {
				if (effect && effect.IsDescendantOf(game)) {
					effect.Destroy();
				}
			});

			// Create new explosion effect
			const newEffects = createExplosionEffect(params);
			effectsRef.current = newEffects;
		});

		return () => {
			cleanup();
			effectsRef.current.forEach((effect) => {
				if (effect && effect.IsDescendantOf(game)) {
					effect.Destroy();
				}
			});
		};
	}, []);

	return <></>;
}

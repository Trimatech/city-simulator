import { usePrevious, useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { SoundService } from "@rbxts/services";
import { selectSoldierFromWorldSubject } from "client/store/world";
import { playSound, sounds } from "shared/assets";
import { selectHasLocalSoldier } from "shared/store/soldiers";

const ERROR_SOUNDS = [sounds.error_1, sounds.error_2, sounds.error_3];

const random = new Random();
const TOTAL_STEPS = 10; // 10 pre-made sounds (0.5 -> 1.0)

export function WorldSounds() {
	const soldier = useSelector(selectSoldierFromWorldSubject);
	const hasLocalSoldier = useSelector(selectHasLocalSoldier);
	const previousOrbs = usePrevious(soldier?.orbs);
	const previousTracerLength = usePrevious(soldier?.tracers?.size());

	const pitchIndexRef = useRef(0);
	const poolByStepRef = useRef<Sound[]>([]);

	// Pre-create a pool of sounds for each pitch step (linear 0.5 -> 1)
	useEffect(() => {
		const created: Sound[] = [];
		for (let step = 0; step < TOTAL_STEPS; step++) {
			const sound = new Instance("Sound");
			sound.SoundId = sounds.button_down;
			sound.Volume = 0; // will set on play
			sound.Looped = false;
			sound.Parent = SoundService;

			const minOctave = 0.5;
			const maxOctave = 1;
			const steps = TOTAL_STEPS - 1;
			const t = math.clamp(step, 0, steps) / steps; // linear
			const pitchOctave = minOctave + t * (maxOctave - minOctave);

			const shift = new Instance("PitchShiftSoundEffect");
			shift.Octave = pitchOctave;
			shift.Parent = sound;

			created.push(sound);
		}

		poolByStepRef.current = created;

		return () => {
			for (const sound of poolByStepRef.current) {
				sound.Destroy();
			}
			poolByStepRef.current = [];
		};
	}, []);

	const volume = hasLocalSoldier ? 0.5 : 0.25;

	const onTracerSound = useThrottleCallback(
		() => {
			const step = pitchIndexRef.current; // 0..TOTAL_STEPS-1

			// Play pre-made sound for this step
			const pool = poolByStepRef.current;
			const sound = pool[step];
			if (!sound) {
				warn("No sound for step", step);
			} else {
				sound.Volume = volume;
				sound.TimePosition = 0;
				sound.Play();
			}

			pitchIndexRef.current = (step + 1) % TOTAL_STEPS;
			print(`step=${step}`);
		},
		{ wait: 0.2 },
	);

	// Death sound
	useEffect(() => {
		if (soldier?.dead) {
			const index = random.NextInteger(0, ERROR_SOUNDS.size() - 1);
			playSound(ERROR_SOUNDS[index], { volume: 2 * volume });
		}
	}, [soldier?.dead]);

	// Spawn sound
	useEffect(() => {
		if (hasLocalSoldier) {
			playSound(sounds.start_game);
		}
	}, [hasLocalSoldier]);

	// Candy eat sound
	useEffect(() => {
		if ((soldier?.orbs ?? 0) > (previousOrbs ?? 0)) {
			const speed = random.NextNumber(0.87, 1);
			playSound(sounds.whoosh, { volume: 0.6 * volume, speed });
		}
	}, [soldier?.orbs]);

	// Tracer placement sound with cycling pitch
	useEffect(() => {
		const currentLength = soldier?.tracers?.size();
		const prevLength = previousTracerLength;

		print(`currentLength=${currentLength}, prevLength=${prevLength}`);

		if (currentLength === undefined) return;

		// Reset pitch cycle when tracers cleared
		if (currentLength === 0) {
			pitchIndexRef.current = 0;
			return;
		}

		// Attempt on each newly added segment; throttle via useThrottleCallback
		if (prevLength !== undefined && currentLength > prevLength) {
			onTracerSound.run();
		}
	}, [soldier?.tracers]);

	return <></>;
}

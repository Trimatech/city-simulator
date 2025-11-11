import { usePrevious, useThrottleCallback } from "@rbxts/pretty-react-hooks";
import React, { memo, useEffect, useRef } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { ContentProvider, Players, SoundService } from "@rbxts/services";
import { useCharacter } from "client/hooks/use-character";
import { selectWorldSubjectDead, selectWorldSubjectOrbs, selectWorldSubjectPolygonAreaSize } from "client/store/world";
import { playSound, sounds } from "shared/assets";
import { selectHasLocalSoldier, selectLocalLastTracerPoint } from "shared/store/soldiers";

const ERROR_SOUNDS = [sounds.error_1, sounds.error_2, sounds.error_3];

const random = new Random();
const TOTAL_STEPS = 10; // 10 pre-made sounds (0.5 -> 1.0)

function WorldSoundsComponent() {
	const dead = useSelector(selectWorldSubjectDead);
	const orbs = useSelector(selectWorldSubjectOrbs);

	const lastTracerPoint = useSelector(selectLocalLastTracerPoint);
	const previousLastTracerPoint = usePrevious(lastTracerPoint);
	const polygonAreaSize = useSelector(selectWorldSubjectPolygonAreaSize);

	const hasLocalSoldier = useSelector(selectHasLocalSoldier);
	const previousOrbs = usePrevious(orbs);
	const previousPolygonAreaSize = usePrevious(polygonAreaSize);

	// Mute default Roblox footstep sounds from the character
	const localPlayer = Players.LocalPlayer;
	const character = useCharacter(localPlayer);

	useEffect(() => {
		if (!character) return;

		function maybeMuteFootstepSound(instance: Instance) {
			if (!instance.IsA("Sound")) return;
			const nameLower = string.lower(instance.Name);
			const [hasFootstep] = string.find(nameLower, "footstep");
			if (nameLower === "running" || nameLower === "footsteps" || hasFootstep !== undefined) {
				instance.Volume = 0;
				instance.Stop();
			}
		}

		for (const descendant of character.GetDescendants()) {
			maybeMuteFootstepSound(descendant);
		}

		const added = character.DescendantAdded.Connect(maybeMuteFootstepSound);
		return () => added.Disconnect();
	}, [character]);

	const pitchIndexRef = useRef(0);
	const poolByStepRef = useRef<Sound[]>([]);
	const thudRef = useRef<Sound>();

	// Pre-create a pool of sounds for each pitch step (linear 0.5 -> 1)
	useEffect(() => {
		const created: Sound[] = [];
		for (let step = 0; step < TOTAL_STEPS; step++) {
			const sound = new Instance("Sound");
			sound.SoundId = sounds.thump_sound;
			sound.Volume = 0; // will set on play
			sound.Looped = false;
			sound.Parent = SoundService;

			const minOctave = 0.7;
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

	// Pre-create a single organic thud sound to avoid initial playback delay
	useEffect(() => {
		const sound = new Instance("Sound");
		sound.SoundId = sounds.POL_organic_thud_02;
		sound.Volume = 0; // set on play
		sound.Looped = false;
		sound.Parent = SoundService;
		thudRef.current = sound;

		// Best-effort preload
		const [ok, err] = pcall(() => ContentProvider.PreloadAsync([sound]));
		if (!ok) warn("Failed to preload thud sound", err);

		return () => {
			thudRef.current?.Destroy();
			thudRef.current = undefined;
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
				sound.Volume = volume * 0.5;
				//sound.TimePosition = 0;
				sound.Play();
			}

			pitchIndexRef.current = (step + 1) % TOTAL_STEPS;
			print(`step=${step}`);
		},
		{ wait: 0.2 },
	);

	// Death sound
	useEffect(() => {
		if (dead) {
			const index = random.NextInteger(0, ERROR_SOUNDS.size() - 1);
			playSound(ERROR_SOUNDS[index], { volume: 2 * volume });
		}
	}, [dead]);

	// Spawn sound
	useEffect(() => {
		if (hasLocalSoldier) {
			playSound(sounds.start_game);
		}
	}, [hasLocalSoldier]);

	// Candy eat sound
	useEffect(() => {
		print("orbs changed.......");
		if (orbs > (previousOrbs ?? 0)) {
			const speed = random.NextNumber(0.87, 1);
			print("playing whoosh.......");
			playSound(sounds.whoosh, { volume: 0.6 * volume, speed });
		}
	}, [orbs]);

	// Polygon grew sound
	useEffect(() => {
		const currentArea = polygonAreaSize;
		const previousArea = previousPolygonAreaSize;

		if (currentArea === undefined || previousArea === undefined) return;
		if (currentArea <= previousArea) return;

		print(`currentArea=${currentArea}, previousArea=${previousArea}`);

		const sound = thudRef.current;
		if (!sound) {
			playSound(sounds.POL_organic_thud_02, { volume: volume * 0.5 });
			return;
		}

		sound.Volume = volume * 0.5;
		// Restart from beginning to ensure instant attack
		sound.TimePosition = 0;
		sound.Play();
	}, [polygonAreaSize]);

	// Tracer placement sound with cycling pitch
	useEffect(() => {
		if (lastTracerPoint === undefined) {
			pitchIndexRef.current = 0;
			return;
		}

		// Attempt on each newly added segment; throttle via useThrottleCallback
		if (lastTracerPoint !== previousLastTracerPoint) {
			onTracerSound.run();
		}
	}, [lastTracerPoint, previousLastTracerPoint]);

	return <></>;
}

export const WorldSounds = memo(WorldSoundsComponent);

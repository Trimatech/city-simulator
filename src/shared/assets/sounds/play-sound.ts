import { SoundService } from "@rbxts/services";
import { IS_EDIT } from "shared/constants/core";

export interface SoundOptions {
	volume?: number;
	speed?: number;
	/**
	 * Pitch shift in octaves applied via PitchShiftSoundEffect.
	 * See: https://create.roblox.com/docs/reference/engine/classes/PitchShiftSoundEffect
	 */
	pitchOctave?: number;
	/**
	 * Distortion amount 0..1 applied via DistortionSoundEffect.Level
	 * See: https://create.roblox.com/docs/reference/engine/classes/DistortionSoundEffect
	 */
	distortionLevel?: number;
	looped?: boolean;
	parent?: Instance;
}

export function createSound(
	soundId: string,
	{ volume = 0.5, speed = 1, looped = false, parent = SoundService, pitchOctave, distortionLevel }: SoundOptions = {},
) {
	const sound = new Instance("Sound");

	sound.SoundId = soundId;
	sound.Volume = volume;
	sound.PlaybackSpeed = speed;
	sound.Looped = looped;

	// Optional pitch shift that does not affect playback speed
	if (pitchOctave !== undefined) {
		const shift = new Instance("PitchShiftSoundEffect");
		shift.Octave = pitchOctave;
		shift.Parent = sound;
	}

	// Optional distortion effect
	if (distortionLevel !== undefined) {
		const distortion = new Instance("DistortionSoundEffect");
		distortion.Level = math.clamp(distortionLevel, 0, 1);
		distortion.Parent = sound;
	}

	sound.Parent = parent;

	return sound;
}

export function playSound(soundId: string, options?: SoundOptions) {
	if (IS_EDIT) {
		return;
	}

	const sound = createSound(soundId, options);

	sound.Ended.Connect(() => sound.Destroy());
	sound.Play();

	return sound;
}

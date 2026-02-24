import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { selectMusicEnabled } from "client/store/settings/settingsSelectors";
import { createSound, sounds } from "shared/assets";
import { type MusicContext, selectLocalMusicContext } from "shared/store/soldiers";
import { shuffle } from "shared/utils/object-utils";

// Playlists per context. All use rbxassetid from Roblox audio library.
const LOBBY: readonly string[] = [sounds.bg_013_Another_August];

const INSIDE_AREA: readonly string[] = [sounds.bg_beautiful_day];

const OUTSIDE_AREA: readonly string[] = [sounds.bg_bugmintide];

const PLAYLISTS: Record<MusicContext, readonly string[]> = {
	lobby: LOBBY,
	"inside-area": INSIDE_AREA,
	"outside-area": OUTSIDE_AREA,
};

const DEFAULT_VOLUME = 0.2;

export function BackgroundMusic() {
	const enabled = useSelector(selectMusicEnabled);
	const context = useSelector(selectLocalMusicContext);

	const [contextQueue, setContextQueue] = useState<readonly string[]>(() => shuffle([...PLAYLISTS[context]]));
	const [index, setIndex] = useState(0);
	const [sound, setSound] = useState<Sound>();
	const previousContextRef = useRef<MusicContext>(context);

	// Advance the queue when the song ends
	useEventListener(sound?.Ended, () => {
		setIndex((idx) => idx + 1);
	});

	// When context changes, switch to the new playlist and reset
	useEffect(() => {
		if (context !== previousContextRef.current) {
			previousContextRef.current = context;
			const playlist = PLAYLISTS[context];
			setContextQueue(shuffle([...playlist]));
			setIndex(0);
		}
	}, [context]);

	// Create the next song when the index or queue changes
	useEffect(() => {
		const queue = contextQueue;
		if (index >= queue.size()) {
			const shuffled = shuffle([...PLAYLISTS[context]]);
			setContextQueue(shuffled);
			setIndex(0);
			return;
		}

		const newSound = createSound(queue[index], { volume: DEFAULT_VOLUME });

		setSound(newSound);

		return () => {
			newSound.Destroy();
		};
	}, [index, contextQueue, context]);

	// Pause/resume when enabled or sound changes
	useEffect(() => {
		if (enabled) {
			sound?.Resume();
		} else {
			sound?.Pause();
		}
	}, [enabled, sound]);

	// Destroy sounds on unmount
	useEffect(() => {
		return () => {
			sound?.Destroy();
		};
	}, [sound]);

	return <></>;
}

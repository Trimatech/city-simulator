import { createBroadcaster, ProducerMiddleware } from "@rbxts/reflex";
import { Players } from "@rbxts/services";
import { IS_EDITOR, WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { SharedState, slices } from "shared/store";

export function broadcasterMiddleware(): ProducerMiddleware {
	if (IS_EDITOR) {
		return () => (dispatch) => dispatch;
	}

	const hydrated = new Set<number>();

	const broadcaster = createBroadcaster({
		producers: slices,
		dispatchRate: WORLD_TICK,
		hydrateRate: -1,
		dispatch: (player, actions) => {
			remotes.store.dispatch.fire(player, actions);
		},
		hydrate: (player, state) => {
			remotes.store.hydrate.fire(player, state as unknown as SharedState);
		},
		beforeHydrate: (_player, state) => {
			return state;
		},
	});

	remotes.store.start.connect((player) => {
		broadcaster.start(player);
	});

	Players.PlayerRemoving.Connect((player) => {
		hydrated.delete(player.UserId);
	});

	return broadcaster.middleware;
}

import { createBroadcaster, ProducerMiddleware } from "@rbxts/reflex";
import { Players } from "@rbxts/services";
import { IS_EDITOR, WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { serializeState, SharedStateSerialized } from "shared/serdes";
import { serializeCellLines } from "shared/serdes/handlers/serdes-grid";
import { SharedState, slices } from "shared/store";

const excludedActions = ["setSoldierPolygon", "setSoldierTracers", "clearSoldierTracers", "soldierTick"];

export function broadcasterMiddleware(): ProducerMiddleware {
	if (IS_EDITOR) {
		return () => (dispatch) => dispatch;
	}

	const hydrated = new Set<number>();

	const broadcaster = createBroadcaster({
		producers: slices,
		dispatchRate: WORLD_TICK,
		hydrateRate: -1,
		beforeDispatch: (_player, action) => {
			// Compress heavy grid updates
			if (action.name === "setCellLines") {
				const cellKey = action.arguments[0] as string;
				const lines = action.arguments[1] as defined;
				// Only serialize if the payload is a table (server side)
				if (typeOf(lines) === "table") {
					const encoded = serializeCellLines(lines as unknown as never);
					return { name: action.name, arguments: [cellKey, encoded] };
				}
			}

			return action;
		},
		dispatch: (player, actions) => {
			remotes.store.dispatch.fire(
				player,
				actions.filter((action) => !excludedActions.includes(action.name)),
			);
		},
		hydrate: (player, state) => {
			remotes.store.hydrate.fire(player, state as unknown as SharedStateSerialized);
		},
		beforeHydrate: (player, state) => {
			const isInitialHydrate = !hydrated.has(player.UserId);
			const serialized = serializeState(state, isInitialHydrate) as unknown as SharedState;

			if (isInitialHydrate) {
				hydrated.add(player.UserId);
				return serialized;
			}

			// exclude candy to reduce network traffic
			return {
				...serialized,
				candy: undefined,
			};
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

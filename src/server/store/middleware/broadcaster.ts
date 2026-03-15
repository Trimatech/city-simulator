import { createBroadcaster, ProducerMiddleware } from "@rbxts/reflex";
import { Players } from "@rbxts/services";
import { IS_EDITOR, WORLD_TICK } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { serializeState, SharedStateSerialized } from "shared/serdes";
import { serializeCellLines } from "shared/serdes/handlers/serdes-grid";
import { SharedState, slices } from "shared/store";

const excludedActions = [
	"setSoldierPolygon",
	"setSoldierTracers",
	"clearSoldierTracers",
	"soldierTick",
	// Grid data is now server-side only; walls are rendered via server-created Parts
	"setCellLines",
	"clearGrid",
	// Candy grid data is now server-side only; candies are rendered via server-created Parts
	"setCandyCell",
	"clearCandyGrid",
];

/** Actions sent only to the player they target (arg[0] = player/soldier name) */
const PLAYER_ONLY_ACTIONS = new Set(["setSoldierLastTracerPoint"]);

function shouldSendActionToPlayer(action: { name: string; arguments: unknown[] }, player: Player): boolean {
	if (excludedActions.includes(action.name)) return false;
	if (PLAYER_ONLY_ACTIONS.has(action.name)) {
		const targetPlayerName = action.arguments[0] as string;
		return targetPlayerName === player.Name;
	}
	return true;
}

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
			const actionsForPlayer = actions.filter((action) => shouldSendActionToPlayer(action, player));
			remotes.store.dispatch.fire(player, actionsForPlayer);
		},
		hydrate: (player, state) => {
			remotes.store.hydrate.fire(player, state as unknown as SharedStateSerialized);
		},
		beforeHydrate: (player, state) => {
			const isInitialHydrate = !hydrated.has(player.UserId);
			const serialized = serializeState(state, isInitialHydrate) as unknown as SharedState;

			if (isInitialHydrate) {
				hydrated.add(player.UserId);
				// Exclude grid and candyGrid from initial hydrate - rendered via server-created Parts
				return {
					...serialized,
					grid: undefined,
					candyGrid: undefined,
				};
			}

			// exclude candy and grid to reduce network traffic
			return {
				...serialized,
				candyGrid: undefined,
				grid: undefined,
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

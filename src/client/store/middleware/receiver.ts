import { createBroadcastReceiver, ProducerMiddleware } from "@rbxts/reflex";
import { IS_EDITOR } from "shared/constants/core";
import { remotes } from "shared/remotes";
import { deserializeState } from "shared/serdes";
import { deserializeCellLines } from "shared/serdes/handlers/serdes-grid";

export function receiverMiddleware(): ProducerMiddleware {
	if (IS_EDITOR) {
		return () => (dispatch) => dispatch;
	}

	const receiver = createBroadcastReceiver({
		start: () => {
			remotes.store.start.fire();
		},
	});

	remotes.store.dispatch.connect((actions) => {
		// Expand any compressed actions before handing to receiver
		for (const action of actions) {
			if (action.name === "setCellLines") {
				const maybeEncoded = action.arguments[1];
				if (typeOf(maybeEncoded) === "string") {
					const decoded = deserializeCellLines(maybeEncoded as string);
					action.arguments[1] = decoded as unknown as never;
				}
			}
		}
		receiver.dispatch(actions);
	});

	remotes.store.hydrate.connect((state) => {
		receiver.hydrate(deserializeState(state));
	});

	return receiver.middleware;
}

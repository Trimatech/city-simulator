import { createBroadcastReceiver, ProducerMiddleware } from "@rbxts/reflex";
import { IS_EDITOR } from "shared/constants/core";
import { remotes } from "shared/remotes";

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
		receiver.dispatch(actions);
	});

	remotes.store.hydrate.connect((state) => {
		receiver.hydrate(state as never);
	});

	return receiver.middleware;
}

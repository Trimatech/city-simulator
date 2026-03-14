import type { AlertI } from "@rbxts-ui/alerts";
import { dismissAlert as packageDismissAlert, sendAlert as packageSendAlert } from "@rbxts-ui/alerts";
import { store } from "client/store";

export function sendAlert(patch: Partial<AlertI>) {
	return packageSendAlert(store, patch);
}

export function dismissAlert(id: number) {
	return packageDismissAlert(store, id);
}

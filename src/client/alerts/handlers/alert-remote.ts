import { sendAlert } from "client/alerts";
import { remotes } from "shared/remotes";

export function connectRemoteAlerts() {
	remotes.client.alert.connect((alert) => {
		sendAlert(alert);
	});
}

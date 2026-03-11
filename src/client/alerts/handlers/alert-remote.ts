import { remotes } from "shared/remotes";

import { sendAlert } from "client/alerts";

export function connectRemoteAlerts() {
	remotes.client.alert.connect((alert) => {
		sendAlert(alert);
	});
}

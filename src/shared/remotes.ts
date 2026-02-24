import { BroadcastAction } from "@rbxts/reflex";
import { Client, createRemotes, namespace, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";
import type { Alert } from "client/store/alert";

import { SharedStateSerialized } from "./serdes";

export const remotes = createRemotes({
	store: namespace({
		dispatch: remote<Client, [actions: BroadcastAction[]]>(),
		hydrate: remote<Client, [state: SharedStateSerialized]>(),
		start: remote<Server>(),
	}),

	soldier: namespace({
		spawn: remote<Server>(),
		kill: remote<Server>(),
		move: remote<Server, [position: Vector2]>(t.Vector2),
	}),

	save: namespace({
		setSkin: remote<Server, [skin: string]>(t.string),
		buySkin: remote<Server, [skin: string]>(t.string),
	}),

	client: namespace({
		alert: remote<Client, [params: Partial<Alert>]>(),
		powerupCarpet: remote<Client, [cframe: CFrame, size: Vector3]>(t.CFrame, t.Vector3),
		powerupNuclear: remote<Client, [cframe: CFrame, size: Vector3]>(t.CFrame, t.Vector3),
	}),

	powerups: namespace({
		use: remote<Server, [id: string]>(t.string),
	}),

	camera: namespace({
		updateBirdPosition: remote<Server, [position: Vector2]>(t.Vector2),
	}),
});

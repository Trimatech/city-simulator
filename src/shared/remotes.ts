import { BroadcastAction } from "@rbxts/reflex";
import { Client, createRemotes, namespace, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";
import type { AlertI as Alert } from "@rbxts-ui/alerts";

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
		continue: remote<Server>(),
		startOver: remote<Server>(),
	}),

	save: namespace({
		setSkin: remote<Server, [skin: string]>(t.string),
		buySkin: remote<Server, [skin: string]>(t.string),
		ascend: remote<Server>(),
	}),

	client: namespace({
		alert: remote<Client, [params: Partial<Alert>]>(),
		powerupCarpet: remote<Client, [cframe: CFrame, size: Vector3]>(t.CFrame, t.Vector3),
		powerupNuke: remote<Client, [cframe: CFrame, size: Vector3]>(t.CFrame, t.Vector3),
		orbsWasted: remote<Client, [amount: number]>(),
		worldDominationWin: remote<
			Client,
			[
				winnerId: string,
				winnerName: string,
				winnerUserId: number,
				areaPercent: number,
				eliminations: number,
				moneyEarned: number,
				crystalsEarned: number,
			]
		>(),
	}),

	powerups: namespace({
		use: remote<Server, [id: string]>(t.string),
	}),

	camera: namespace({
		updateBirdPosition: remote<Server, [position: Vector2]>(t.Vector2),
	}),

	dailyReward: namespace({
		notify: remote<Client, [streakDay: number, crystalAmount: number]>(),
		claim: remote<Server>(),
	}),

	admin: namespace({
		executeCommand: remote<Server, [command: string, args: string, target: string]>(t.string, t.string, t.string),
	}),
});

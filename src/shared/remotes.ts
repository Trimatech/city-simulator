import { BroadcastAction } from "@rbxts/reflex";
import { Client, createRemotes, namespace, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";

import type { TileDelta } from "./simulation/tile-map";

export const remotes = createRemotes({
	store: namespace({
		dispatch: remote<Client, [actions: BroadcastAction[]]>(),
		hydrate: remote<Client, [state: unknown]>(),
		start: remote<Server>(),
	}),

	city: namespace({
		/** Send the full tile map on initial join */
		hydrateMap: remote<Client, [mapData: number[]]>(),
		/** Send tile deltas each sim tick */
		applyDeltas: remote<Client, [deltas: TileDelta[]]>(),
		/** Player requests to use a tool at a tile position */
		placeTool: remote<Server, [tool: string, x: number, y: number]>(t.string, t.number, t.number),
		/** Player sets simulation speed */
		setSpeed: remote<Server, [speed: number]>(t.number),
		/** Player updates budget settings */
		setBudget: remote<
			Server,
			[taxRate: number, roadFunding: number, policeFunding: number, fireFunding: number]
		>(t.number, t.number, t.number, t.number),
	}),
});

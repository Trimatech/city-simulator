/// <reference types="@rbxts/testez/globals" />

import Object from "@rbxts/object-utils";
import { store } from "server/store";
import { selectAliveSoldiersById } from "shared/store/soldiers";

export = () => {
	it("should spawn 5 bots when a human is alive", () => {
		store.addSoldier("__human__");
		store.flush();
		const alive = store.getState(selectAliveSoldiersById);
		let bots = 0;
		for (const rawId of Object.keys(alive as unknown as { [id: string]: unknown })) {
			const id = tostring(rawId);
			if (string.sub(id, 1, 4) === "BOT_") bots += 1;
		}
		expect(bots).to.equal(5);
	});

	it("should remove all bots when no humans are alive", () => {
		// remove the human
		store.removeSoldier("__human__");
		store.flush();
		const alive = store.getState(selectAliveSoldiersById);
		for (const rawId of Object.keys(alive as unknown as { [id: string]: unknown })) {
			const id = tostring(rawId);
			expect(string.sub(id, 1, 4)).never.to.equal("BOT_");
		}
	});

	it("should trim bots down to 5 if above limit", () => {
		// re-add a human
		store.addSoldier("__human__");
		store.flush();
		// artificially add more bots
		for (const i of $range(6, 8)) {
			store.addSoldier(`BOT_${i}`);
		}
		store.flush();
		const alive = store.getState(selectAliveSoldiersById);
		let bots = 0;
		for (const rawId of Object.keys(alive as unknown as { [id: string]: unknown })) {
			const id = tostring(rawId);
			if (string.sub(id, 1, 4) === "BOT_") bots += 1;
		}
		expect(bots).to.equal(5);
	});
};

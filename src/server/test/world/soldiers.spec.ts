/// <reference types="@rbxts/testez/globals" />

import { store } from "server/store";
import { getSoldier, onSoldierTick } from "server/world";

export = () => {
	it("should update soldier boost", () => {
		store.addSoldier("__test__");
		store.boostSoldier("__test__", true);
		expect(getSoldier("__test__")?.boost).to.equal(true);
	});

	it("should step soldier physics", () => {
		store.addSoldier("__test__");
		onSoldierTick();
		const soldier = getSoldier("__test__")!;
		expect(soldier.position).to.never.equal(Vector2.zero);
		expect(soldier.tracers.size()).to.never.equal(0);
	});

	it("should not move dead soldiers", () => {
		store.addSoldier("__test__", { dead: true });
		onSoldierTick();
		const initialSoldier = getSoldier("__test__")!;
		onSoldierTick();
		const finalSoldier = getSoldier("__test__")!;
		expect(initialSoldier.position).to.equal(finalSoldier.position);
	});
};

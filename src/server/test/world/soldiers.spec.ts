/// <reference types="@rbxts/testez/globals" />

import { store } from "server/store";
import { getSoldier, onSoldierTick } from "server/world";

export = () => {
	it("should step soldier physics", () => {
		store.addSoldier("__test__");

		store.moveSoldier("__test__", new Vector2(100, 100));

		// tracers are created when soldier is outside
		store.setSoldierIsInside("__test__", false);
		onSoldierTick();

		const soldier = getSoldier("__test__")!;
		expect(soldier.position).to.never.equal(Vector2.zero);
		expect(soldier.tracers.size()).to.never.equal(0);
	});

	it("should set shieldActiveUntil state", () => {
		const id = "__shield__";
		store.addSoldier(id);
		let s = getSoldier(id)!;
		expect(s.shieldActiveUntil).to.equal(0);
		store.setSoldierShieldActiveUntil(id, 1000);
		s = getSoldier(id)!;
		expect(s.shieldActiveUntil).to.equal(1000);
		store.setSoldierShieldActiveUntil(id, 0);
		s = getSoldier(id)!;
		expect(s.shieldActiveUntil).to.equal(0);
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

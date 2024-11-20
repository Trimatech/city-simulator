/// <reference types="@rbxts/testez/globals" />

import { store } from "server/store";
import { getSoldier, onCollisionTick, onSoldierTick } from "server/world";
import { WORLD_BOUNDS } from "shared/constants/core";

export = () => {
	it("should kill soldier on collision", () => {
		store.addSoldier("__test1__", { position: new Vector2(0, 0) });
		store.addSoldier("__test2__", { position: new Vector2(0, 100) });
		onSoldierTick();
		store.patchSoldier("__test1__", { position: new Vector2(0, 100) });
		onCollisionTick();
		const soldier1 = getSoldier("__test1__");
		const soldier2 = getSoldier("__test2__");
		expect(soldier1?.dead).to.equal(true);
		expect(soldier2?.dead).to.equal(false);
	});

	it("should not kill soldier on self-collision", () => {
		store.addSoldier("__test__", { position: new Vector2(0, 0) });
		onSoldierTick();
		onCollisionTick();
		const soldier = getSoldier("__test__");
		expect(soldier?.dead).to.equal(false);
	});

	it("should not kill soldier when not colliding", () => {
		store.addSoldier("__test1__", { position: new Vector2(0, 0) });
		store.addSoldier("__test2__", { position: new Vector2(0, 100) });
		onSoldierTick();
		onCollisionTick();
		const soldier1 = getSoldier("__test1__");
		const soldier2 = getSoldier("__test2__");
		expect(soldier1?.dead).to.equal(false);
		expect(soldier2?.dead).to.equal(false);
	});

	it("should not kill soldier when collided with dead soldier", () => {
		store.addSoldier("__test1__", { position: new Vector2(0.1, 100) });
		store.addSoldier("__test2__", { position: new Vector2(0, 100) });
		onSoldierTick();
		store.patchSoldier("__test2__", { dead: true });
		onCollisionTick();
		const soldier1 = getSoldier("__test1__");
		const soldier2 = getSoldier("__test2__");
		expect(soldier1?.dead).to.equal(false);
		expect(soldier2?.dead).to.equal(true);
	});

	it("should kill soldiers out of bounds", () => {
		store.addSoldier("__test__", { position: new Vector2(0, WORLD_BOUNDS + 1) });
		expect(getSoldier("__test__")?.dead).to.equal(false);
		onCollisionTick();
		expect(getSoldier("__test__")?.dead).to.equal(true);
	});
};

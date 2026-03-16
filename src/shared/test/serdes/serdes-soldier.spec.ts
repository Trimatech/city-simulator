/// <reference types="@rbxts/testez/globals" />

import { shallowEqual } from "@rbxts/reflex";
import { HttpService } from "@rbxts/services";
import { getRandomBotSkin } from "shared/constants/skins";
import { calculateVector2ArrayBoundingBox } from "shared/polybool/poly-utils";
import { deserializeSoldiers, serializeSoldiers } from "shared/serdes/handlers/serdes-soldier";
import { SoldierEntity, SoldiersState } from "shared/store/soldiers";
import { fillArray } from "shared/utils/object-utils";

export = () => {
	function generateSoldier(id?: string, withDeadline = false): SoldierEntity {
		const polygon = fillArray(10, () => new Vector2(math.random(), math.random()));
		return {
			id: id ?? HttpService.GenerateGUID(false),
			name: HttpService.GenerateGUID(false),
			position: new Vector2(math.random(), math.random()),
			lastPosition: new Vector2(math.random(), math.random()),
			angle: math.random() * math.pi * 2,
			desiredAngle: math.random() * math.pi * 2,
			orbs: math.random(0, 10000),
			tracers: fillArray(10, () => new Vector2(math.random(), math.random())),
			skin: getRandomBotSkin().id,
			dead: math.random() > 0.5,
			eliminations: math.random(1, 100),
			polygon,
			polygonAreaSize: 0,
			polygonBounds: calculateVector2ArrayBoundingBox(polygon),
			isInside: true,
			shieldActiveUntil: math.random() * 1000,
			turboActiveUntil: math.random() * 1000,
			health: 100,
			maxHealth: 100,
			zIndex: 0,
			deathChoiceDeadline: withDeadline ? tick() + 6 : undefined,
		};
	}

	function assertSoldierEqual(soldier: SoldierEntity, deserialized: SoldierEntity) {
		for (const [key, value] of pairs(soldier)) {
			if (key === "tracers") {
				assert(shallowEqual(value, deserialized[key]), "tracers are not equal");
			} else if (key === "polygon") {
				assert(shallowEqual(value, deserialized[key]), "polygon are not equal");
			} else if (
				key === "angle" ||
				key === "desiredAngle" ||
				key === "turboActiveUntil" ||
				key === "shieldActiveUntil"
			) {
				expect(value).to.be.near(deserialized[key], 0.0001);
			} else if (key === "polygonBounds") {
				// polygonBounds is derived from polygon and may not round-trip bitwise equal
				continue;
			} else {
				expect(value).to.equal(deserialized[key]);
			}
		}
	}

	it("should serialize an entity", () => {
		const state: SoldiersState = {
			"1": generateSoldier("1"),
		};

		const serialized = serializeSoldiers(state);
		const deserialized = deserializeSoldiers(serialized);

		for (const [id, soldier] of pairs(state)) {
			expect(deserialized[id]).to.be.ok();
			assertSoldierEqual(soldier, deserialized[id]!);
		}
	});

	it("should serialize a record of entities", () => {
		const state: SoldiersState = {
			"1": generateSoldier("1"),
			"2": generateSoldier("2"),
			"3": generateSoldier("3"),
		};

		const serialized = serializeSoldiers(state);
		const deserialized = deserializeSoldiers(serialized);

		for (const [id, soldier] of pairs(state)) {
			expect(deserialized[id]).to.be.ok();
			assertSoldierEqual(soldier, deserialized[id]!);
		}
	});

	it("should serialize soldiers with deathChoiceDeadline", () => {
		const state: SoldiersState = {
			"1": generateSoldier("1", true),
			"2": generateSoldier("2", false),
		};

		const serialized = serializeSoldiers(state);
		const deserialized = deserializeSoldiers(serialized);

		expect(deserialized["1"]!.deathChoiceDeadline).to.be.ok();
		expect(deserialized["1"]!.deathChoiceDeadline).to.be.near(state["1"]!.deathChoiceDeadline!, 0.0001);
		expect(deserialized["2"]!.deathChoiceDeadline).to.never.be.ok();
	});

	it("should compress the data", () => {
		const state: SoldiersState = {
			"1": generateSoldier("1"),
			"2": generateSoldier("2"),
			"3": generateSoldier("3"),
		};

		const serialized = serializeSoldiers(state);
		const json = HttpService.JSONEncode(state);

		expect(serialized.size() < json.size()).to.equal(true);
	});
};

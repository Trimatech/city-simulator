/// <reference types="@rbxts/testez/globals" />

import { store } from "server/store";
import { CANDY_LIMITS, createCandy, getSoldier, onCandyTick, removeCandy, addCandyEntity } from "server/world";
import { CandyType } from "shared/store/candy-grid/candy-types";
import { selectAllCandies, selectCandyGridCount } from "shared/store/candy-grid/candy-grid-selectors";
import { fillArray } from "shared/utils/object-utils";

export = () => {
    const countCandy = (candyType?: CandyType) => {
        return store.getState(selectCandyGridCount(candyType));
    };

    const didEatCandy = (id: string) => {
        // No direct selector now; rely on story runtime grid removal timing
        // For unit check, we assume that removal indicates eaten state
        const all = store.getState(selectAllCandies);
        return all.find((c) => c.id === id) === undefined;
    };

	it("should populate the state with candy", () => {
		expect(countCandy()).to.equal(CANDY_LIMITS[CandyType.Default]);
	});

	it("should create new candy when the amount decreases", () => {
    const candies = store.getState(selectAllCandies);
		const candiesToRemove = new Set(candies.move(0, 5, 0, []));

        for (const candy of candiesToRemove) {
            removeCandy((candy as unknown as { id: string }).id);
        }

		expect(countCandy()).to.equal(CANDY_LIMITS[CandyType.Default] - candiesToRemove.size());
		store.flush();

    const newCandies = store.getState(selectAllCandies);
		expect(countCandy()).to.equal(CANDY_LIMITS[CandyType.Default]);
		expect(newCandies.every((candy) => !candiesToRemove.has(candy))).to.equal(true);
	});

	it("should not create new candy when the amount increases", () => {
    const [template] = store.getState(selectAllCandies);

        for (const index of $range(1, 10)) {
            addCandyEntity({ ...(template as unknown as any), id: `__test__${index}` });
        }

		expect(countCandy()).to.equal(CANDY_LIMITS[CandyType.Default] + 10);
		store.flush();
		expect(countCandy()).to.equal(CANDY_LIMITS[CandyType.Default] + 10);
	});

	it("should create candy when a soldier dies", () => {
		store.addSoldier("__test__");

		store.flush();
		store.setSoldierIsDead("__test__");
		store.flush();
	});

	it("should keep candy population at the max if a soldier dies", () => {
    const initialCandy = store.getState(selectAllCandies);

		store.addSoldier("__test__");

		store.flush();
		store.setSoldierIsDead("__test__");
		store.flush();

		expect(countCandy() > CANDY_LIMITS[CandyType.Default]).to.equal(true);

		for (const index of $range(1, 50)) {
        const candy = initialCandy[index] as unknown as { id: string };
        removeCandy(candy.id);
		}

		store.flush();

		expect(countCandy() > CANDY_LIMITS[CandyType.Default]).to.equal(true);
	});

	it("should eat candy when a soldier is close", () => {
    const candy = createCandy({ size: 10, position: new Vector2(1000, 1000) });
    addCandyEntity(candy);
		store.addSoldier("__test__", { position: new Vector2(1000, 1000.1) });
		store.flush();
		onCandyTick();
		expect(didEatCandy(candy.id)).to.equal(true);
		expect(getSoldier("__test__")!.orbs).to.never.equal(0);
	});

	it("should not eat candy if a soldier is far away", () => {
    const candy = createCandy({ size: 10, position: Vector2.zero });
    addCandyEntity(candy);
		store.addSoldier("__test__", { position: new Vector2(100, 100) });
		store.flush();
		onCandyTick();
		expect(didEatCandy(candy.id)).to.equal(false);
	});

	it("should remove excess droppings", () => {
    const candies = fillArray(CANDY_LIMITS[CandyType.Dropping] + 1, () => {
			return createCandy({ type: CandyType.Dropping });
		});
    for (const c of candies) addCandyEntity(c);
		expect(countCandy(CandyType.Dropping)).to.equal(CANDY_LIMITS[CandyType.Dropping] + 1);
		store.flush();
		expect(countCandy(CandyType.Dropping)).to.equal(CANDY_LIMITS[CandyType.Dropping]);
	});
};

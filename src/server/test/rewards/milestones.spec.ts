/// <reference types="@rbxts/testez/globals" />

import { Players } from "@rbxts/services";
import { store } from "server/store";
import { SCORE_MILESTONES, selectMilestone } from "server/store/milestones";

export = () => {
	const player = Players.FindFirstChildWhichIsA("Player");

	if (!player) {
		SKIP();
		return;
	}

	it("should create a milestone", () => {
		store.addSoldier(player.Name, {});
		store.flush();
		const milestone = store.getState(selectMilestone(player.Name));
		expect(milestone).to.be.ok();
	});

	describe("milestone update", () => {
		it("sets top rank", () => {
			let milestone;

			store.addSoldier(player.Name, {});
			store.addSoldier("0", { score: 100 });
			store.addSoldier("1", { score: 100 });
			store.addSoldier("2", { score: 100 });
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topRank).to.equal(4);

			store.patchSoldier(player.Name, { score: 200 });
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topRank).to.equal(1);
		});

		it("sets top score", () => {
			let milestone;

			store.addSoldier(player.Name, {});
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topScore).to.equal(undefined);

			store.patchSoldier(player.Name, { score: 100 });
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topScore).to.equal(undefined);

			store.patchSoldier(player.Name, { score: SCORE_MILESTONES[2] });
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topScore).to.equal(SCORE_MILESTONES[2]);

			store.patchSoldier(player.Name, { score: SCORE_MILESTONES[1] });
			store.flush();

			milestone = store.getState(selectMilestone(player.Name))!;
			expect(milestone.topScore).to.equal(SCORE_MILESTONES[2]);
		});
	});

	it("should remove the milestone", () => {
		store.addSoldier(player.Name, {});
		store.flush();
		store.removeSoldier(player.Name);
		store.flush();
		const milestone = store.getState(selectMilestone(player.Name));
		expect(milestone).to.equal(undefined);
	});
};

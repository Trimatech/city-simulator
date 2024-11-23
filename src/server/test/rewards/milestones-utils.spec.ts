/// <reference types="@rbxts/testez/globals" />

import { HttpService } from "@rbxts/services";
import {
	getMaxArea,
	getMilestoneArea,
	SCORE_MILESTONES,
	SCORE_MILESTONES_REVERSE,
} from "server/store/milestones/milestone-utils";

export = () => {
	it("should be correct reversed", () => {
		expect(HttpService.JSONEncode(SCORE_MILESTONES_REVERSE)).to.equal(
			"[1000000,500000,250000,100000,50000,25000,10000,5000]",
		);
	});
	it("should find first value", () => {
		expect(getMilestoneArea(5000)).to.equal(SCORE_MILESTONES[0]);
		expect(getMilestoneArea(10000)).to.equal(SCORE_MILESTONES[1]);
		expect(getMilestoneArea(25000)).to.equal(SCORE_MILESTONES[2]);
		expect(getMilestoneArea(50000)).to.equal(SCORE_MILESTONES[3]);
		expect(getMilestoneArea(100000)).to.equal(SCORE_MILESTONES[4]);
		expect(getMilestoneArea(250000)).to.equal(SCORE_MILESTONES[5]);
		expect(getMilestoneArea(500000)).to.equal(SCORE_MILESTONES[6]);
		expect(getMilestoneArea(1000000)).to.equal(SCORE_MILESTONES[7]);
	});

	itFOCUS("Max area of studs2", () => {
		const maxArea = getMaxArea();
		expect(maxArea).to.equal(2_895_291.7895483533);
	});
};

/// <reference types="@rbxts/testez/globals" />

import { candyGrid } from "server/world";

import { resetStore } from "../helpers/reset-store";

export = () => {
	beforeAll(() => {
		//	initWorldServices();
	});

	beforeEach(() => {
		resetStore();
	});

	afterEach(() => {
		resetStore();
		candyGrid.clear();
	});
};

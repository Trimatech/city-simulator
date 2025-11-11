import "client/app/react-config";

import { useMountEffect } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Stats } from "client/components/stats/Stats";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

function StatsStoryContent() {
	useMountEffect(() => {
		store.setPlayerSave(USER_NAME, {
			...defaultPlayerSave,
			balance: 1000,
		});
	});

	return (
		<RootProvider>
			<Stats />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <StatsStoryContent />,
};

export = story;

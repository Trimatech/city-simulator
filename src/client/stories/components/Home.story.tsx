import "client/app/react-config";

import { useMountEffect } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Home } from "client/components/menu/home/home";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

import { useMockRemotes } from "../utils/use-mock-remotes";

function HomeStoryContent() {
	useMockRemotes();

	useMountEffect(() => {
		store.setPlayerSave(USER_NAME, defaultPlayerSave);
	});

	return (
		<RootProvider>
			<Home />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	story: () => <HomeStoryContent />,
};

export = story;

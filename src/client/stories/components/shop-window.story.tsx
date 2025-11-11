import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { ShopWindow } from "client/components/menu/shop/ShopWindow";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

import { useMockRemotes } from "../utils/use-mock-remotes";

const controls = {
	balance: Number(10, 0, 10000, 10),
};

function ShopWindowStoryContent({ balance }: { balance: number }) {
	useMockRemotes();

	useEffect(() => {
		store.setPlayerSave(USER_NAME, defaultPlayerSave);
	}, []);

	useEffect(() => {
		store.patchPlayerSave(USER_NAME, { balance });
	}, [balance]);

	return (
		<RootProvider>
			<ShopWindow />
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { balance } = props.controls;
		return <ShopWindowStoryContent balance={balance as number} />;
	},
};

export = story;

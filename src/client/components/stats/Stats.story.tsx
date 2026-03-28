import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Boolean, InferFusionProps, Number } from "@rbxts/ui-labs";
import { Stats } from "client/components/stats/Stats";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME } from "shared/constants/core";
import { defaultPlayerSave } from "shared/store/saves";

// Added above the local player so rank displays as 3rd
const FAKE_BOT_IDS = ["story-bot-1", "story-bot-2"];

const controls = {
	horizontal: Boolean(false),
	showSoldierData: Boolean(true),
	showBalance: Boolean(true),
	eliminations: Number(42, 0, 9999, 1),
	orbs: Number(150, 0, 5000, 1),
	area: Number(12500, 0, 100000, 100),
	balance: Number(1000, 0, 100000, 100),
};

interface StoryProps {
	horizontal: boolean;
	showSoldierData: boolean;
	showBalance: boolean;
	eliminations: number;
	orbs: number;
	area: number;
	balance: number;
}

function StatsStoryContent({
	horizontal,
	showSoldierData,
	showBalance,
	eliminations,
	orbs,
	area,
	balance,
}: StoryProps) {
	useEffect(() => {
		for (const id of FAKE_BOT_IDS) {
			store.addSoldier(id, { name: id, position: Vector2.zero });
			store.setSoldierPolygonAreaSize(id, 99999);
		}
		return () => {
			for (const id of FAKE_BOT_IDS) {
				store.removeSoldier(id);
			}
		};
	}, []);

	useEffect(() => {
		if (showSoldierData) {
			store.addSoldier(USER_NAME, { name: USER_NAME, position: Vector2.zero, orbs, eliminations });
			store.setSoldierPolygonAreaSize(USER_NAME, area);
		} else {
			store.removeSoldier(USER_NAME);
		}
	}, [showSoldierData, eliminations, orbs, area]);

	useEffect(() => {
		if (showBalance) {
			store.setPlayerSave(USER_NAME, { ...defaultPlayerSave, balance });
		} else {
			store.deletePlayerSave(USER_NAME);
		}
	}, [showBalance, balance]);

	return (
		<RootProvider>
			<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Position={new UDim2(0.5, 0, 0.5, 0)}>
				<Stats direction={horizontal ? "horizontal" : "vertical"} />
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { horizontal, showSoldierData, showBalance, eliminations, orbs, area, balance } = props.controls;
		return (
			<StatsStoryContent
				horizontal={horizontal as boolean}
				showSoldierData={showSoldierData as boolean}
				showBalance={showBalance as boolean}
				eliminations={eliminations as number}
				orbs={orbs as number}
				area={area as number}
				balance={balance as number}
			/>
		);
	},
};

export = story;

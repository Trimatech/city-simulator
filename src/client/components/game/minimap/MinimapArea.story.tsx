import "client/app/react-config";

import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Choose, InferFusionProps, Number } from "@rbxts/ui-labs";
import { MinimapArea } from "client/components/game/minimap/MinimapArea";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { USER_NAME, WORLD_BOUNDS } from "shared/constants/core";
import { getRandomBotSkin } from "shared/constants/skins";

const STORY_LEADER_ID = "story-minimap-leader";
const STORY_ENEMY_ID = "story-minimap-enemy";
const WORLD_AREA = math.pi * math.pow(WORLD_BOUNDS, 2);
const WINNER_OPTIONS = ["Local player", "Top-right enemy", "Bottom-right enemy"];

const STORY_SOLDIERS = [
	{
		id: USER_NAME,
		position: new Vector2(-WORLD_BOUNDS * 0.2, WORLD_BOUNDS * 0.15),
		skin: getRandomBotSkin().id,
	},
	{
		id: STORY_LEADER_ID,
		position: new Vector2(WORLD_BOUNDS * 0.4, -WORLD_BOUNDS * 0.35),
		skin: getRandomBotSkin().id,
	},
	{
		id: STORY_ENEMY_ID,
		position: new Vector2(WORLD_BOUNDS * 0.05, WORLD_BOUNDS * 0.25),
		skin: getRandomBotSkin().id,
	},
] as const;

const controls = {
	localOwnedPercent: Number(18.4, 0, 100, 0.1),
	winner: Choose(WINNER_OPTIONS),
};

interface StoryProps {
	localOwnedPercent: number;
	winner: string;
}

function MinimapAreaStoryContent({ localOwnedPercent, winner }: StoryProps) {
	useEffect(() => {
		for (const soldier of STORY_SOLDIERS) {
			store.addSoldier(soldier.id, {
				name: soldier.id,
				position: soldier.position,
				skin: soldier.skin,
			});
		}

		return () => {
			for (const soldier of STORY_SOLDIERS) {
				store.removeSoldier(soldier.id);
			}
		};
	}, []);

	useEffect(() => {
		// `selectTopSoldier` picks the soldier with the largest polygonAreaSize only.
		// Previously "Local player" could lose because enemy areas used a high floor (e.g. 6% of world)
		// while local area followed the slider — so the leader never matched the winner control.
		const baseFromSlider = (math.clamp(localOwnedPercent, 0, 100) / 100) * WORLD_AREA;
		const step = WORLD_AREA * 0.01;

		if (winner === "Local player") {
			const leaderArea = baseFromSlider + step * 3;
			store.setSoldierPolygonAreaSize(USER_NAME, leaderArea);
			store.setSoldierPolygonAreaSize(STORY_LEADER_ID, leaderArea * 0.4);
			store.setSoldierPolygonAreaSize(STORY_ENEMY_ID, leaderArea * 0.2);
		} else if (winner === "Top-right enemy") {
			const leaderArea = math.max(baseFromSlider, step * 2) + step * 3;
			store.setSoldierPolygonAreaSize(STORY_LEADER_ID, leaderArea);
			store.setSoldierPolygonAreaSize(USER_NAME, baseFromSlider);
			store.setSoldierPolygonAreaSize(STORY_ENEMY_ID, leaderArea * 0.45);
		} else {
			const leaderArea = math.max(baseFromSlider, step * 2) + step * 3;
			store.setSoldierPolygonAreaSize(STORY_ENEMY_ID, leaderArea);
			store.setSoldierPolygonAreaSize(USER_NAME, baseFromSlider);
			store.setSoldierPolygonAreaSize(STORY_LEADER_ID, leaderArea * 0.45);
		}
	}, [localOwnedPercent, winner]);

	return (
		<RootProvider>
			<frame BackgroundColor3={Color3.fromRGB(14, 17, 26)} Size={new UDim2(1, 0, 1, 0)}>
				<uigradient
					Color={
						new ColorSequence([
							new ColorSequenceKeypoint(0, Color3.fromRGB(25, 31, 47)),
							new ColorSequenceKeypoint(1, Color3.fromRGB(9, 11, 18)),
						])
					}
					Rotation={90}
				/>

				<frame
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={1}
					Position={new UDim2(0.5, 0, 0.5, 0)}
					Size={new UDim2(0, 280, 0, 340)}
				>
					<MinimapArea />
				</frame>
			</frame>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { localOwnedPercent, winner } = props.controls;
		return <MinimapAreaStoryContent localOwnedPercent={localOwnedPercent as number} winner={winner as string} />;
	},
};

export = story;

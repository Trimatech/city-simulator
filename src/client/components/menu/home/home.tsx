import React from "@rbxts/react";
import { useRem } from "client/hooks";
import { Group } from "client/ui/layout/group";

import { GameVersion } from "./GameVersion";
import { MuteButton } from "./mute-button";
import { PlayButton } from "./play-button";

export function Home() {
	const rem = useRem();

	return (
		<>
			<PlayButton
				anchorPoint={new Vector2(0.5, 0.5)}
				size={new UDim2(0, rem(18), 0, rem(4.5))}
				position={new UDim2(0.5, 0, 1, -rem(5.5))}
			/>
			<GameVersion />

			<Group anchorPoint={new Vector2(1, 1)} size={new UDim2()} position={new UDim2(1, rem(-3), 1, rem(-3))}>
				<uilistlayout
					Padding={new UDim(0, rem(1))}
					VerticalAlignment="Bottom"
					HorizontalAlignment="Right"
					FillDirection="Horizontal"
				/>
				<MuteButton />
			</Group>
		</>
	);
}

import React from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { HomeStats } from "client/components/stats/HomeStats";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import { ROOT_PADDING } from "shared/constants/theme";

import { GameVersion } from "./GameVersion";
import { MuteButton } from "./MuteButton";
import { PlayButton } from "./PlayButton";

interface HomeProps {
	visible: boolean;
}

export function Home({ visible }: HomeProps) {
	const rem = useRem();
	return (
		<>
			<SlideIn visible={visible} direction="right">
				<Frame
					anchorPoint={new Vector2(1, 1)}
					size={new UDim2()}
					position={new UDim2(1, rem(-ROOT_PADDING), 1, rem(-ROOT_PADDING))}
				>
					<uilistlayout
						Padding={new UDim(0, rem(1))}
						VerticalAlignment="Bottom"
						HorizontalAlignment="Right"
						FillDirection="Horizontal"
					/>
					<MuteButton />
				</Frame>
			</SlideIn>

			<SlideIn visible={visible} direction="bottom">
				<PlayButton
					anchorPoint={new Vector2(0.5, 0.5)}
					size={new UDim2(0, rem(18), 0, rem(4.5))}
					position={new UDim2(0.5, 0, 1, -rem(5.5))}
				/>
				<GameVersion />

				<HStack
					anchorPoint={new Vector2(0, 1)}
					size={new UDim2(1, 0, 0, rem(10))}
					position={new UDim2(0, 0, 1, 0)}
					verticalAlignment={Enum.VerticalAlignment.Bottom}
				>
					<HomeStats />
				</HStack>
			</SlideIn>
		</>
	);
}

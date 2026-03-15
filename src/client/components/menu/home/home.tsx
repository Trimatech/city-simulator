import React, { useState } from "@rbxts/react";
import { HStack } from "@rbxts-ui/layout";
import { Frame } from "@rbxts-ui/primitives";
import { HomeStats } from "client/components/stats/HomeStats";
import { MainButton, ShopButtonTextWithIcon } from "client/ui/MainButton";
import { Overlay } from "client/ui/Overlay";
import { useRem } from "client/ui/rem/useRem";
import { SlideIn } from "client/ui/slide-in";
import assets from "shared/assets";
import { ROOT_PADDING } from "shared/constants/theme";

import { DailyRewardScreen } from "../daily-reward/DailyRewardScreen";
import { ShopWindow } from "../shop/ShopWindow";
import { GameVersion } from "./GameVersion";
import { MuteButton } from "./MuteButton";
import { PlayButton } from "./PlayButton";

const enum Window {
	Shop = "shop",
	DailyReward = "dailyReward",
}

interface HomeProps {
	visible: boolean;
}

export function Home({ visible }: HomeProps) {
	const rem = useRem();
	const [openWindow, setOpenWindow] = useState<Window | undefined>();

	return (
		<>
			<SlideIn visible={visible} direction="left">
				<HStack
					position={new UDim2(0, rem(ROOT_PADDING), 0, rem(ROOT_PADDING) + rem(4))}
					verticalAlignment={Enum.VerticalAlignment.Top}
					spacing={rem(1)}
				>
					<MainButton
						onClick={() => setOpenWindow(Window.Shop)}
						size={new UDim2(0, rem(10), 0, rem(4))}
						fitContent
					>
						<ShopButtonTextWithIcon text="Shop" icon={assets.ui.icons.store} />
					</MainButton>
					<MainButton
						onClick={() => setOpenWindow(Window.DailyReward)}
						size={new UDim2(0, rem(16), 0, rem(4))}
						fitContent
					>
						<ShopButtonTextWithIcon text="Daily Rewards" icon={assets.ui.icons.dailyRewards} />
					</MainButton>
				</HStack>
			</SlideIn>

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

			{openWindow === Window.Shop && (
				<>
					<Overlay onClick={() => setOpenWindow(undefined)} />
					<ShopWindow onClose={() => setOpenWindow(undefined)} />
				</>
			)}

			{openWindow === Window.DailyReward && (
				<>
					<Overlay onClick={() => setOpenWindow(undefined)} />
					<DailyRewardScreen onDismiss={() => setOpenWindow(undefined)} />
				</>
			)}
		</>
	);
}

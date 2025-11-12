import React, { useState } from "@rbxts/react";
import { useSelector } from "@rbxts/react-reflex";
import { HomeStats } from "client/components/stats/HomeStats";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { ReactiveButton } from "client/ui/reactive-button/reactive-button";
import { Text } from "client/ui/text";
import { palette } from "shared/constants/palette";
import { ROOT_PADDING } from "shared/constants/theme";
import { selectHasLocalSoldier } from "shared/store/soldiers";

import { ShopWindow } from "../shop/ShopWindow";
import { GameVersion } from "./GameVersion";
import { MuteButton } from "./MuteButton";
import { PlayButton } from "./PlayButton";

export function Home() {
	const rem = useRem();
	const [isShopOpen, setIsShopOpen] = useState(false);

	const spawned = useSelector(selectHasLocalSoldier);

	if (spawned) {
		return undefined;
	}

	return (
		<>
			<PlayButton
				anchorPoint={new Vector2(0.5, 0.5)}
				size={new UDim2(0, rem(18), 0, rem(4.5))}
				position={new UDim2(0.5, 0, 1, -rem(5.5))}
			/>
			<GameVersion />

			<HStack
				position={new UDim2(0, rem(ROOT_PADDING), 0, rem(ROOT_PADDING) + rem(4))}
				verticalAlignment={Enum.VerticalAlignment.Top}
			>
				<PrimaryButton onClick={() => setIsShopOpen(true)} size={new UDim2(0, rem(10), 0, rem(4))}>
					<Text font={fonts.inter.medium} text={"🛒 Shop"} textSize={rem(1.6)} size={new UDim2(1, 0, 1, 0)} />
				</PrimaryButton>
			</HStack>

			<HStack
				anchorPoint={new Vector2(0, 1)}
				size={new UDim2(1, 0, 0, rem(10))}
				position={new UDim2(0, 0, 1, 0)}
				verticalAlignment={Enum.VerticalAlignment.Bottom}
			>
				<HomeStats />
			</HStack>

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

			{isShopOpen && (
				<>
					<ReactiveButton
						onClick={() => setIsShopOpen(false)}
						backgroundTransparency={0.2}
						backgroundColor={palette.teal}
						size={new UDim2(1, 0, 1, 0)}
						position={new UDim2(0, 0, 0, 0)}
					/>

					<ShopWindow onClose={() => setIsShopOpen(false)} />
				</>
			)}
		</>
	);
}

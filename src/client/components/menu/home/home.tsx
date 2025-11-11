import React, { useState } from "@rbxts/react";
import { useRem } from "client/hooks";
import { Group } from "client/ui/layout/group";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import { fonts } from "client/constants/fonts";
import { ReactiveButton } from "client/ui/reactive-button/reactive-button";

import { GameVersion } from "./GameVersion";
import { MuteButton } from "./mute-button";
import { PlayButton } from "./PlayButton";
import { ShopWindow } from "../shop/ShopWindow";

export function Home() {
	const rem = useRem();
	const [isShopOpen, setIsShopOpen] = useState(false);

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
				<PrimaryButton onClick={() => setIsShopOpen(true)} size={new UDim2(0, rem(10), 0, rem(4))}>
					<Text
						font={fonts.inter.medium}
						text={"🛒 Shop"}
						textSize={rem(1.6)}
						size={new UDim2(1, 0, 1, 0)}
					/>
				</PrimaryButton>
			</Group>

			{isShopOpen && (
				<>
					<ReactiveButton
						onClick={() => setIsShopOpen(false)}
						backgroundTransparency={1}
						size={new UDim2(1, 0, 1, 0)}
						position={new UDim2(0, 0, 0, 0)}
						zIndex={10}
					/>
					<Group zIndex={11} size={new UDim2(1, 0, 1, 0)}>
						<ShopWindow />
					</Group>
				</>
			)}
		</>
	);
}

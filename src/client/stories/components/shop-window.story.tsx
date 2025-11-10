import "client/app/react-config";

import { hoarcekat, useMountEffect } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { ShopWindow } from "client/components/menu/shop/ShopWindow";
import { RootProvider } from "client/providers/root-provider";
import { store } from "client/store";
import { useRem } from "client/hooks";
import { HStack } from "client/ui/layout/HStack";
import { Frame } from "client/ui/layout/frame";
import { PrimaryButton } from "client/ui/PrimaryButton";
import { Text } from "client/ui/text";
import { USER_NAME } from "shared/constants/core";
import { allWallSkins, freeWallSkins } from "shared/constants/skins";
import { defaultPlayerSave } from "shared/store/saves";

import { useMockRemotes } from "../utils/use-mock-remotes";

function Controls() {
	const rem = useRem();

	return (
		<Frame size={new UDim2(1, 0, 0, rem(5))} backgroundTransparency={1} position={new UDim2(0, 0, 0, 0)}>
			<HStack spacing={rem(1)} size={new UDim2(1, 0, 1, 0)} padding={rem(1)}>
				<PrimaryButton
					onClick={() => {
						store.setPlayerSave(USER_NAME, {
							...defaultPlayerSave,
							balance: 0,
						});
					}}
					size={new UDim2(0, rem(14), 1, 0)}
				>
					<Text text="Zero Balance" position={new UDim2(0.5, 0, 0.5, 0)} anchorPoint={new Vector2(0.5, 0.5)} />
				</PrimaryButton>

				<PrimaryButton
					onClick={() => {
						store.patchPlayerSave(USER_NAME, { balance: 10000 });
					}}
					size={new UDim2(0, rem(14), 1, 0)}
				>
					<Text text="Rich Balance" position={new UDim2(0.5, 0, 0.5, 0)} anchorPoint={new Vector2(0.5, 0.5)} />
				</PrimaryButton>

				<PrimaryButton
					onClick={() => {
						store.setPlayerSave(USER_NAME, defaultPlayerSave);
					}}
					size={new UDim2(0, rem(12), 1, 0)}
				>
					<Text text="Reset Save" position={new UDim2(0.5, 0, 0.5, 0)} anchorPoint={new Vector2(0.5, 0.5)} />
				</PrimaryButton>

				<PrimaryButton
					onClick={() => {
						store.patchPlayerSave(USER_NAME, { skins: [defaultPlayerSave.skins[0]], skin: defaultPlayerSave.skins[0] });
					}}
					size={new UDim2(0, rem(16), 1, 0)}
				>
					<Text text="Clear Owned" position={new UDim2(0.5, 0, 0.5, 0)} anchorPoint={new Vector2(0.5, 0.5)} />
				</PrimaryButton>

				<PrimaryButton
					onClick={() => {
						const paid = allWallSkins.map((s) => s.id);
						store.patchPlayerSave(USER_NAME, { skins: [defaultPlayerSave.skins[0], ...paid] });
					}}
					size={new UDim2(0, rem(18), 1, 0)}
				>
					<Text text="Own All Skins" position={new UDim2(0.5, 0, 0.5, 0)} anchorPoint={new Vector2(0.5, 0.5)} />
				</PrimaryButton>
			</HStack>
		</Frame>
	);
}

export = hoarcekat(() => {
	useMockRemotes();

	useMountEffect(() => {
		store.setPlayerSave(USER_NAME, defaultPlayerSave);
	});

	return (
		<RootProvider>
			<Controls />
			<ShopWindow />
		</RootProvider>
	);
});



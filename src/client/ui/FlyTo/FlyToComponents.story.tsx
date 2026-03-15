import "client/app/react-config";

import { useInterval } from "@rbxts/pretty-react-hooks";
import React, { useRef } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Image } from "@rbxts-ui/primitives";
import { RootProvider } from "client/providers/root-provider";
import { images } from "shared/assetsFolder";
import { randomInt } from "shared/utils/MathUtil";

import { FlyToComponents } from "./FlyToComponents";

const controls = {};

const CustomComponent = () => {
	const imageRef = useRef<ImageLabel>();

	const image = images.ui.heart;

	useInterval(() => {
		warn("interval.....");
	}, 1000 * 4);

	const amount = randomInt(1, 10);

	return (
		<RootProvider>
			<Image ref={imageRef} image={image} position={new UDim2(0.5, 0, 0.5, 0)} size={new UDim2(0, 100, 0, 100)} />
			<FlyToComponents amount={amount} statsImageRef={imageRef} image={image} />
		</RootProvider>
	);
};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: () => {
		return <CustomComponent />;
	},
};

export = story;

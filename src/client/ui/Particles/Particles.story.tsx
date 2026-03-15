import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { EnumList, InferFusionProps } from "@rbxts/ui-labs";
import { HStack } from "@rbxts-ui/layout";
import { RootProvider } from "client/providers/root-provider";

import { Particles } from "./Particles";
import { configMap, configTypes, ConfigValues, imageMap, imageTypes, ImageValues } from "./Particles.utils2";

const controls = {
	configValue: EnumList<ConfigValues>(configTypes, ConfigValues[0], false),
	imageValue: EnumList<ImageValues>(imageTypes, ImageValues[0], false),
};

const CustomComponent = ({ configValue, imageValue }: { configValue: ConfigValues; imageValue: ImageValues }) => {
	const image = imageMap[imageValue];
	const config = configMap[configValue];
	return (
		<RootProvider>
			<HStack
				size={new UDim2(1, 0, 1, 0)}
				verticalAlignment={Enum.VerticalAlignment.Center}
				horizontalAlignment={Enum.HorizontalAlignment.Center}
			>
				<Particles config={{ ...config, texture: image }} size={new UDim2(0, 100, 0, 100)} />
			</HStack>
		</RootProvider>
	);
};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls: controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { configValue, imageValue } = props.controls;
		return <CustomComponent configValue={configValue} imageValue={imageValue} />;
	},
};

export = story;

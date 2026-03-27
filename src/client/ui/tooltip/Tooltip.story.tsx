import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps } from "@rbxts/ui-labs";
import { VStack } from "@rbxts-ui/layout";
import { PortalFrame } from "client/providers/PortalFrame";
import { RemProvider } from "client/ui/rem/RemProvider";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { Tooltip } from "./Tooltip";

const StoryComponent = () => {
	const rem = useRem();

	return (
		<RemProvider>
			<PortalFrame>
				<VStack
					size={new UDim2(0, rem(25), 1, 0)}
					backgroundColor={palette.dark}
					backgroundTransparency={0}
					padding={rem(3)}
					spacing={rem(3)}
				>
					<Tooltip tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
					<Tooltip tooltipText="Short tooltip" />
				</VStack>
			</PortalFrame>
		</RemProvider>
	);
};

const controls = {};

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (_props: InferFusionProps<typeof controls>) => {
		return <StoryComponent />;
	},
};

export = story;

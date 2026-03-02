import "client/app/react-config";

import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferFusionProps, Number } from "@rbxts/ui-labs";
import { ProgressBar } from "client/components/ProgressBar";
import { useRem } from "client/hooks";
import { RootProvider } from "client/providers/root-provider";
import { Frame } from "client/ui/layout/frame";
import { VStack } from "client/ui/layout/VStack";

const controls = {
	current: Number(65, 0, 100, 1),
	target: Number(100, 1, 200, 1),
};

function ProgressBarStoryContent({ current, target }: { current: number; target: number }) {
	const rem = useRem();
	return (
		<RootProvider>
			<VStack size={new UDim2(1, 0, 1, 0)}>
				<Frame size={new UDim2(0, 300, 0, 20)}>
					<ProgressBar current={current} target={target} height={rem(2)} />
				</Frame>
			</VStack>
		</RootProvider>
	);
}

const story = {
	react: React,
	reactRoblox: ReactRoblox,
	controls,
	story: (props: InferFusionProps<typeof controls>) => {
		const { current, target } = props.controls;
		return <ProgressBarStoryContent current={current as number} target={target as number} />;
	},
};

export = story;

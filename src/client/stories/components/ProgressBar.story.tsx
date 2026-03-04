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
	progress: Number(0.65, 0, 1, 0.01),
};

function ProgressBarStoryContent({ progress }: { progress: number }) {
	const rem = useRem();
	return (
		<RootProvider>
			<VStack size={new UDim2(1, 0, 1, 0)}>
				<Frame size={new UDim2(0, 300, 0, 20)}>
					<ProgressBar progress={progress} height={rem(2)} />
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
		const { progress } = props.controls;
		return <ProgressBarStoryContent progress={progress as number} />;
	},
};

export = story;

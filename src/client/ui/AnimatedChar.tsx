import { composeBindings } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { SpringOptions } from "@rbxts/ripple";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Text } from "client/ui/text";

interface AnimatedCharProps {
	readonly index: number;
	readonly char: string;
	readonly amplitudePx: number;
	readonly staggerSeconds: number;
	readonly periodSeconds: number;
	readonly holdSeconds: number;
	readonly font: Font;
	readonly textColor: Color3;
	readonly textSize: number;
	readonly springOptions?: SpringOptions;
}

export function AnimatedChar({
	index,
	char,
	amplitudePx,
	staggerSeconds,
	periodSeconds,
	holdSeconds,
	font,
	textColor,
	textSize,
	springOptions,
}: AnimatedCharProps) {
	const [y, yMotion] = useMotion(0);

	React.useEffect(() => {
		let alive = true;
		task.spawn(() => {
			const initialDelay = index * staggerSeconds;
			if (initialDelay > 0) task.wait(initialDelay);
			while (alive) {
				yMotion.spring(-amplitudePx, springOptions ?? springs.bubbly);
				task.wait(holdSeconds);
				yMotion.spring(0, springOptions ?? springs.bubbly);
				task.wait(periodSeconds);
			}
		});
		return () => {
			alive = false;
		};
	}, [index, amplitudePx, staggerSeconds, periodSeconds, holdSeconds, springOptions]);

	const positionBinding = composeBindings(y, (v) => new UDim2(0, 0, 0.5, v));

	return (
		<Frame automaticSize={Enum.AutomaticSize.X} size={new UDim2(0, 0, 1, 0)}>
			<Text
				font={font}
				text={char}
				textColor={textColor}
				textSize={textSize}
				textYAlignment="Center"
				textAutoResize="X"
				size={new UDim2(0, 0, 1, 0)}
				position={positionBinding}
				anchorPoint={new Vector2(0, 0.5)}
			/>
		</Frame>
	);
}

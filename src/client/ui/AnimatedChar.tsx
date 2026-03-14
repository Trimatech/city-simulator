import { composeBindings } from "@rbxts/pretty-react-hooks";
import React, { useEffect } from "@rbxts/react";
import { SpringOptions } from "@rbxts/ripple";
import { Frame, Text } from "@rbxts-ui/primitives";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { palette } from "shared/constants/palette";

import { useRem } from "./rem/useRem";

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
	readonly pulseToken?: number;
}

const textStrokeGradient = new ColorSequence(palette.textStrokeFrom, palette.textStrokeTo);

export function AnimatedChar({
	index,
	char,
	amplitudePx,
	staggerSeconds,
	periodSeconds: _periodSeconds,
	holdSeconds,
	font,
	textColor,
	textSize,
	springOptions,
	pulseToken,
}: AnimatedCharProps) {
	const [y, yMotion] = useMotion(0);
	const rem = useRem();
	const animationSpring = springOptions ?? springs.bubbly;

	useEffect(() => {
		if (pulseToken === undefined) return;

		let alive = true;
		const startDelay = index * staggerSeconds;

		const trigger = () => {
			if (!alive) return;

			yMotion.spring(-amplitudePx, springs.responsive);

			task.delay(holdSeconds, () => {
				if (!alive) return;
				yMotion.spring(0, animationSpring);
			});
		};
		if (startDelay > 0) {
			task.delay(startDelay, trigger);
		} else {
			trigger();
		}
		return () => {
			alive = false;
		};
	}, [pulseToken, index, amplitudePx, staggerSeconds, holdSeconds, animationSpring]);

	const positionBinding = composeBindings(y, (v) => new UDim2(0, 0, 0.5, v));

	return (
		<Frame automaticSize={Enum.AutomaticSize.X} size={new UDim2(0, 0, 1, 0)}>
			<Text
				text={char}
				font={font}
				textColor={textColor}
				textSize={textSize}
				textYAlignment="Center"
				textAutoResize="X"
				size={new UDim2(0, 0, 1, 0)}
				position={positionBinding}
				anchorPoint={new Vector2(0, 0.5)}
			>
				<uistroke Thickness={rem(0.15)} Color={palette.white}>
					<uigradient Color={textStrokeGradient} Rotation={90} />
				</uistroke>
			</Text>
		</Frame>
	);
}

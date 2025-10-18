import { composeBindings } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { SpringOptions } from "@rbxts/ripple";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { Frame, FrameProps } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { Text } from "client/ui/text";
import { palette } from "shared/constants/palette";

interface AnimatedTextProps extends FrameProps {
	readonly text: string;
	readonly font?: Font;
	readonly textColor?: Color3;
	readonly textSize?: number;
	readonly spacing?: number;
	readonly speed?: number; // cycles per second
	readonly amplitudeRem?: number; // jump height in rem units
	readonly phaseStep?: number; // per-letter phase shift [legacy]
	readonly staggerSeconds?: number; // per-letter start delay
	readonly periodSeconds?: number; // time between pulses
	readonly holdSeconds?: number; // time to hold at peak before returning
	readonly horizontalAlignment?: Enum.HorizontalAlignment;
	readonly verticalAlignment?: Enum.VerticalAlignment;
	readonly springOptions?: SpringOptions;
}

export function AnimatedText({
	text,
	font = fonts.inter.medium,
	textColor = palette.mantle,
	textSize,
	spacing,
	speed = 0.6,
	amplitudeRem = 0.5,
	phaseStep = 0.09,
	staggerSeconds,
	periodSeconds = 4,
	holdSeconds = 0.12,
	horizontalAlignment = Enum.HorizontalAlignment.Center,
	verticalAlignment = Enum.VerticalAlignment.Center,
	name,
	size,
	position,
	anchorPoint,
	zIndex,
	layoutOrder,
	backgroundTransparency,
	clipsDescendants,
	springOptions,
}: AnimatedTextProps) {
	const rem = useRem();

	function splitUtf8(input: string) {
		const result = new Array<string>();
		let index = 1;
		let nextP = utf8.offset(input, 2, index);
		while (nextP !== undefined) {
			result.push(string.sub(input, index, nextP - 1));
			index = nextP;
			nextP = utf8.offset(input, 2, index);
		}
		result.push(string.sub(input, index, -1));
		return result;
	}

	const chars = splitUtf8(text);
	const amplitudePx = rem(amplitudeRem);
	const letterSpacing = spacing ?? rem(0.1);
	const actualTextSize = textSize ?? rem(1.5);
	const effectiveStagger = (staggerSeconds !== undefined ? staggerSeconds : phaseStep) ?? 0;

	return (
		<HStack
			name={name ?? "animated-text"}
			size={size ?? new UDim2(1, 0, 1, 0)}
			position={position}
			anchorPoint={anchorPoint}
			zIndex={zIndex}
			layoutOrder={layoutOrder}
			backgroundTransparency={backgroundTransparency}
			clipsDescendants={clipsDescendants}
			horizontalAlignment={horizontalAlignment}
			verticalAlignment={verticalAlignment}
			spacing={letterSpacing}
		>
			{chars.map((ch, i) => (
				<AnimatedChar
					key={`char-${i as number}`}
					index={i as number}
					char={ch}
					amplitudePx={amplitudePx}
					staggerSeconds={effectiveStagger}
					periodSeconds={periodSeconds}
					holdSeconds={holdSeconds}
					font={font}
					textColor={textColor}
					textSize={actualTextSize}
					springOptions={springOptions}
				/>
			))}
		</HStack>
	);
}

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

function AnimatedChar({
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

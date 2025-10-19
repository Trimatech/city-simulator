import React from "@rbxts/react";
import { SpringOptions } from "@rbxts/ripple";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/hooks";
import { FrameProps } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { palette } from "shared/constants/palette";

import { AnimatedChar } from "./AnimatedChar";

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

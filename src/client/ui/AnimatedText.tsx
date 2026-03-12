import React, { useEffect, useState } from "@rbxts/react";
import { SpringOptions } from "@rbxts/ripple";
import { HStack } from "@rbxts-ui/layout";
import { FrameProps } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useRem } from "client/ui/rem/useRem";
import { palette } from "shared/constants/palette";

import { AnimatedChar } from "./AnimatedChar";
import { splitUtf8 } from "./AnimatedText.utils";

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
	font = fonts.inter.bold,
	textColor = palette.mantle,
	textSize,
	spacing,
	speed: _speed = 0.6,
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

	const chars = splitUtf8(text);
	const amplitudePx = rem(amplitudeRem);
	const letterSpacing = spacing ?? rem(0.1);
	const actualTextSize = textSize ?? rem(1.5);
	const effectiveStagger = (staggerSeconds !== undefined ? staggerSeconds : phaseStep) ?? 0;

	const [pulseToken, setPulseToken] = useState(0);

	useEffect(() => {
		let alive = true;
		const cycle = holdSeconds + periodSeconds;
		const tick = () => {
			if (!alive) return;
			setPulseToken((v) => v + 1);
			task.delay(cycle, tick);
		};
		tick();
		return () => {
			alive = false;
		};
	}, [holdSeconds, periodSeconds]);

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
					pulseToken={pulseToken}
					font={font}
					textColor={textColor}
					textSize={actualTextSize}
					springOptions={springOptions}
				/>
			))}
		</HStack>
	);
}

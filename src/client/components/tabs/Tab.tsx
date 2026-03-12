import React, { useMemo } from "@rbxts/react";
import { Outline, ReactiveButton2 } from "@rbxts-ui/components";
import { Transition } from "@rbxts-ui/layout";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { useMotion, useRem } from "client/hooks";
import { palette } from "shared/constants/palette";

interface Props {
	readonly onClick?: () => void;
	readonly emoji: string;
	readonly label: string;
	readonly active: boolean;
	readonly order: number;
}

const CARD_MARGIN = 1;
const CARD_PADDING = 0.75 * 3;
const CARD_PADDING_RIGHT = 0.75;
const CARD_HEIGHT = 4;
const CARD_EMOJI_WIDTH = 2;
const CARD_CANVAS_MARGIN = 3;

const CARD_BORDER_WIDTH = 0.2;

export function Tab({ onClick, emoji, label, active, order }: Props) {
	const rem = useRem();

	const bgColor = active ? palette.blue : palette.sky;

	const [textWidth, textWidthMotion] = useMotion({ label: 0, value: 0 });

	const size = useMemo(() => {
		return textWidth.map(({ label, value }) => {
			const content = math.max(label, value);
			const width = CARD_EMOJI_WIDTH + CARD_PADDING + CARD_PADDING_RIGHT + 2 * CARD_MARGIN;
			return new UDim2(0, rem(width) + content, 0, rem(CARD_HEIGHT));
		});
	}, [rem]);

	const roundness = rem(50);

	const cornerRadius = new UDim(0, roundness);

	return (
		<ReactiveButton2 onClick={onClick} backgroundTransparency={1} size={size} layoutOrder={order}>
			<Transition
				size={new UDim2(1, rem(2 * CARD_CANVAS_MARGIN), 1, rem(2 * CARD_CANVAS_MARGIN))}
				position={new UDim2(0, rem(-CARD_CANVAS_MARGIN), 0, rem(-CARD_CANVAS_MARGIN))}
			>
				<uipadding
					PaddingTop={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingBottom={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingLeft={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingRight={new UDim(0, rem(CARD_CANVAS_MARGIN))}
				/>

				{/* Backgroun strip */}
				<Frame
					backgroundTransparency={0}
					backgroundColor={bgColor}
					cornerRadius={cornerRadius}
					size={new UDim2(1, 0, 1, 0)}
				>
					<Outline
						cornerRadius={cornerRadius}
						innerTransparency={0}
						outerTransparency={1}
						innerThickness={rem(CARD_BORDER_WIDTH)}
					/>
				</Frame>

				{/* Icon rounded background */}
				<Frame
					backgroundTransparency={0}
					backgroundColor={palette.white}
					cornerRadius={new UDim(0, rem(30))}
					anchorPoint={new Vector2(0, 0.5)}
					position={new UDim2(0, rem(CARD_BORDER_WIDTH), 0.5, 0)}
					size={new UDim2(0, rem(CARD_HEIGHT - CARD_BORDER_WIDTH), 0, rem(CARD_HEIGHT - CARD_BORDER_WIDTH))}
				/>

				<Text
					text={emoji}
					textSize={rem(2)}
					size={new UDim2(0, rem(CARD_EMOJI_WIDTH), 1, 0)}
					position={new UDim2(0, rem(CARD_MARGIN), 0, 0)}
				/>

				{/* Main text */}
				<Text
					key="text"
					font={fonts.inter.regular}
					text={label}
					textColor={palette.white}
					backgroundTransparency={1}
					textSize={rem(1.8)}
					textXAlignment="Left"
					textYAlignment="Center"
					size={new UDim2(1, 0, 1, 0)}
					position={new UDim2(0, rem(CARD_MARGIN + CARD_EMOJI_WIDTH + CARD_PADDING), 0, 0)}
					change={{
						TextBounds: (rbx) => {
							textWidthMotion.spring({ label: rbx.TextBounds.X });
						},
					}}
				/>
			</Transition>
		</ReactiveButton2>
	);
}

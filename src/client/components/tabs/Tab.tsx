import React, { useEffect, useMemo } from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion, useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { Outline } from "client/ui/outline";
import { ReactiveButton } from "client/ui/reactive-button";
import { Shadow } from "client/ui/shadow";
import { Text } from "client/ui/text";
import { Transition } from "client/ui/transition";
import { gradientTabActive, gradientTabInactive, palette } from "shared/constants/palette";

interface Props {
	readonly onClick?: () => void;
	readonly emoji: string;
	readonly label: string;
	readonly enabled: boolean;
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

export function Tab({ onClick, emoji, label, active, enabled, order }: Props) {
	const rem = useRem();

	const gradient = active ? gradientTabActive : gradientTabInactive;

	const [transparency, transparencyMotion] = useMotion(1);
	const [textWidth, textWidthMotion] = useMotion({ label: 0, value: 0 });

	const size = useMemo(() => {
		return textWidth.map(({ label, value }) => {
			const content = math.max(label, value);
			const width = CARD_EMOJI_WIDTH + CARD_PADDING + CARD_PADDING_RIGHT + 2 * CARD_MARGIN;
			return new UDim2(0, rem(width) + content, 0, rem(CARD_HEIGHT));
		});
	}, [rem]);

	useEffect(() => {
		transparencyMotion.spring(enabled ? 0 : 0.75, springs.slow);
	}, [enabled]);

	const roundness = rem(20);

	return (
		<ReactiveButton onClick={onClick} soundVariant="alt" backgroundTransparency={1} size={size} layoutOrder={order}>
			<Transition
				groupTransparency={transparency}
				size={new UDim2(1, rem(2 * CARD_CANVAS_MARGIN), 1, rem(2 * CARD_CANVAS_MARGIN))}
				position={new UDim2(0, rem(-CARD_CANVAS_MARGIN), 0, rem(-CARD_CANVAS_MARGIN))}
			>
				<uipadding
					PaddingTop={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingBottom={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingLeft={new UDim(0, rem(CARD_CANVAS_MARGIN))}
					PaddingRight={new UDim(0, rem(CARD_CANVAS_MARGIN))}
				/>

				<Shadow
					shadowColor={palette.white}
					shadowBlur={0.3}
					shadowPosition={rem(0.5)}
					shadowSize={active ? rem(6) : rem(1)}
					shadowTransparency={0.7}
				>
					<uigradient Color={gradient} Rotation={71} />
				</Shadow>

				{/* Backgroun strip */}
				<Frame
					backgroundTransparency={active ? 0.1 : 0.9}
					backgroundColor={palette.white}
					cornerRadius={new UDim(0, roundness)}
					size={new UDim2(1, 0, 1, 0)}
				>
					<uigradient Color={gradient} Rotation={71} />
					<Outline cornerRadius={new UDim(0, roundness)} />
				</Frame>

				{/* Icon rounded background */}
				<Frame
					backgroundTransparency={0.35}
					backgroundColor={palette.black}
					cornerRadius={new UDim(0, rem(30))}
					anchorPoint={new Vector2(0, 0.5)}
					position={new UDim2(0, rem(CARD_BORDER_WIDTH), 0.5, 0)}
					size={new UDim2(0, rem(CARD_HEIGHT - CARD_BORDER_WIDTH), 0, rem(CARD_HEIGHT - CARD_BORDER_WIDTH))}
				></Frame>

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
				></Text>
			</Transition>
		</ReactiveButton>
	);
}

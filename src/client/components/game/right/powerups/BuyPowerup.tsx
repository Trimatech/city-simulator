import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useRem } from "client/hooks";
import { Frame } from "client/ui/layout/frame";
import { HStack } from "client/ui/layout/HStack";
import { ReactiveButton } from "client/ui/reactive-button";
import { Text } from "client/ui/text";
import { Transition } from "client/ui/transition";
import { palette } from "shared/constants/palette";

interface Props {
	readonly onClick?: () => void;
	readonly emoji: string;
	readonly label: string;
	readonly primaryColor: Color3;
	readonly enabled: boolean;
	readonly order: number;
	readonly circleSize?: number;
	readonly width?: number;
	readonly emojiSize?: number;
	readonly price: number;
}

const MARGIN_Y = 0;

const INTERNAL_PADDING = 1;

export function BuyPowerup({
	onClick,
	emoji,
	label,
	primaryColor,
	enabled,
	order,
	circleSize = 6,
	width = 0,
	emojiSize = 2.5,
	price,
}: Props) {
	const rem = useRem();
	const CIRCLE_SIZE = circleSize; // That means from top and bottom should be PADDING_LEFT*2 = HEIGHT
	const EMOJI_SIZE = CIRCLE_SIZE / emojiSize;

	const isRound = emoji !== undefined;

	const HEIGHT = rem(CIRCLE_SIZE);

	const WIDTH = isRound ? HEIGHT : HEIGHT + rem(width);

	const [transparency, transparencyMotion] = useMotion(1);
	const [size, sizeMotion] = useMotion(new UDim2(0, WIDTH, 0, HEIGHT));
	const [backgroundColor, backgroundColorMotion] = useMotion(primaryColor);

	useEffect(() => {
		transparencyMotion.spring(enabled ? 0.1 : 0.15, springs.slow);
	}, [enabled]);

	useEffect(() => {
		backgroundColorMotion.spring(enabled ? primaryColor : palette.overlay2, springs.slow);
	}, [enabled, primaryColor]);

	const fullRound = new UDim(1, 0);

	const [showTooltip, setShowTooltip] = useState(false);

	const TOOLTIP_WIDTH = rem(8);

	const FULL_WIDTH = WIDTH + TOOLTIP_WIDTH;

	useEffect(() => {
		sizeMotion.spring(new UDim2(0, showTooltip ? FULL_WIDTH : WIDTH, 0, HEIGHT), springs.gentle);
	}, [showTooltip, WIDTH, FULL_WIDTH, HEIGHT]);

	return (
		<ReactiveButton
			onClick={onClick}
			enabled={enabled}
			backgroundTransparency={1}
			size={size}
			layoutOrder={order}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			anchorPoint={new Vector2(1, 0.5)}
		>
			<Transition
				groupTransparency={transparency}
				size={new UDim2(1, 0, 1, rem(2 * MARGIN_Y))}
				position={new UDim2(0, 0, 0, rem(-MARGIN_Y))}
			>
				{/* Background */}
				<Frame
					backgroundTransparency={0}
					backgroundColor={backgroundColor}
					cornerRadius={fullRound}
					size={new UDim2(1, -rem(1), 1, -rem(1))}
					anchorPoint={new Vector2(0.5, 0.5)}
					position={new UDim2(0.5, 0, 0.5, 0)}
				/>

				<HStack clipsDescendants={false} horizontalAlignment={Enum.HorizontalAlignment.Right}>
					{showTooltip ? (
						<HStack spacing={rem(INTERNAL_PADDING)} size={new UDim2(0, TOOLTIP_WIDTH, 0, HEIGHT)} wraps>
							<uipadding PaddingLeft={new UDim(0, rem(1.5))} />
							<Text
								text={label}
								size={new UDim2(1, 0, 0, rem(1))}
								font={fonts.inter.bold}
								textColor={palette.crust}
								textSize={rem(1.5)}
								textXAlignment="Center"
								textYAlignment="Center"
								richText
							/>

							<Text size={new UDim2(1, 0, 0, rem(1))} text={`🔮 ${price}`} textSize={rem(1)} />
						</HStack>
					) : undefined}
					{/* Emoji */}

					<Frame size={new UDim2(0, rem(CIRCLE_SIZE), 0, rem(CIRCLE_SIZE))}>
						<Frame
							backgroundColor={palette.white}
							backgroundTransparency={0.7}
							cornerRadius={fullRound}
							anchorPoint={new Vector2(0.5, 0.5)}
							position={new UDim2(0.5, 0, 0.5, 0)}
							size={new UDim2(1, -rem(1), 1, -rem(1))}
						>
							<uistroke Color={palette.white} Transparency={0.7} Thickness={rem(0.2)} />
						</Frame>

						<Text
							text={emoji}
							textScaled
							anchorPoint={new Vector2(0.5, 0.5)}
							size={new UDim2(0, rem(EMOJI_SIZE), 0, rem(EMOJI_SIZE))}
							position={new UDim2(0.5, 0, 0.5, 0)}
						/>
					</Frame>
				</HStack>
			</Transition>
		</ReactiveButton>
	);
}

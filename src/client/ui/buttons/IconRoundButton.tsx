import { useMotion } from "@rbxts/pretty-react-hooks";
import React, { useEffect, useState } from "@rbxts/react";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useRem } from "client/hooks";
import { palette } from "shared/constants/palette";

import { Frame } from "../layout/frame";
import { Group } from "../layout/group";
import { HStack } from "../layout/HStack";
import { Padding } from "../Padding";
import { ReactiveButton } from "../reactive-button";
import { Shadow } from "../shadow";
import { Text } from "../text";
import { Tooltip } from "../tooltip";
import { Transition } from "../transition";

interface Props {
	readonly onClick?: () => void;
	readonly emoji?: string;
	readonly label?: string;
	readonly primaryColor: Color3;
	readonly enabled: boolean;
	readonly order: number;
	readonly circleSize?: number;
	readonly addShadow?: boolean;
	readonly width?: number;
	readonly emojiSize?: number;
	readonly tooltipText?: string;
}

const MARGIN_Y = 0;
const INTERNAL_PADDING = 1;

export function IconRoundButton({
	onClick,
	emoji,
	label,
	primaryColor,
	enabled,
	order,
	circleSize = 6,
	width = 0,
	addShadow = false,
	emojiSize = 2.5,
	tooltipText,
}: Props) {
	const rem = useRem();
	const CIRCLE_SIZE = circleSize; // That means from top and bottom should be PADDING_LEFT*2 = HEIGHT
	const EMOJI_SIZE = CIRCLE_SIZE / emojiSize;

	const isRound = emoji !== undefined;

	const HEIGHT = rem(CIRCLE_SIZE);

	const WIDTH = isRound ? HEIGHT : HEIGHT + rem(width);

	const [transparency, transparencyMotion] = useMotion(1);

	useEffect(() => {
		transparencyMotion.spring(enabled ? 0 : 0.75, springs.slow);
	}, [enabled]);

	const fullRound = new UDim(1, 0);

	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<ReactiveButton
			onClick={onClick}
			backgroundTransparency={1}
			size={new UDim2(0, WIDTH, 0, HEIGHT)}
			layoutOrder={order}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<Transition
				groupTransparency={transparency}
				size={new UDim2(1, 0, 1, rem(2 * MARGIN_Y))}
				position={new UDim2(0, 0, 0, rem(-MARGIN_Y))}
			>
				{tooltipText ? (
					<Tooltip
						text={tooltipText}
						visible={showTooltip}
						position={new UDim2(0, -rem(5), 0, rem(9))}
						maxWidth={rem(3.2)}
					/>
				) : undefined}
				{/* Margin */}
				<Padding paddingY={rem(MARGIN_Y)} />

				{addShadow && (
					<Shadow
						shadowColor={primaryColor}
						shadowTransparency={0.4}
						shadowSize={rem(CIRCLE_SIZE / 3)}
						shadowPosition={rem(CIRCLE_SIZE / 3)}
						zIndex={0}
					/>
				)}

				{/* Background */}
				<Frame
					backgroundTransparency={0}
					backgroundColor={primaryColor}
					cornerRadius={fullRound}
					size={new UDim2(1, 0, 1, 0)}
				/>

				<HStack spacing={rem(INTERNAL_PADDING)} clipsDescendants={false}>
					{/* Emoji */}
					{emoji ? (
						<Group size={new UDim2(0, rem(CIRCLE_SIZE), 0, rem(CIRCLE_SIZE))}>
							<Frame
								backgroundColor={palette.white}
								backgroundTransparency={0.7}
								cornerRadius={fullRound}
								anchorPoint={new Vector2(0.5, 0.5)}
								position={new UDim2(0.5, 0, 0.5, 0)}
								size={new UDim2(1, 0, 1, 0)}
							>
								<uistroke Color={palette.white} Transparency={0.7} Thickness={0.5} />
							</Frame>

							<Text
								text={emoji}
								textScaled
								anchorPoint={new Vector2(0.5, 0.5)}
								size={new UDim2(0, rem(EMOJI_SIZE), 0, rem(EMOJI_SIZE))}
								position={new UDim2(0.5, 0, 0.5, 0)}
							/>
						</Group>
					) : undefined}

					{/* Label */}
					{label ? (
						<Text
							text={label}
							anchorPoint={new Vector2(0.5, 0.5)}
							size={new UDim2(1, 0, 1, 0)}
							position={new UDim2(0.5, 0, 0.5, 0)}
							font={fonts.inter.bold}
							textColor={palette.subtext1}
							textSize={rem(1.5)}
							textXAlignment="Center"
							textYAlignment="Center"
							richText
						/>
					) : undefined}
				</HStack>
			</Transition>
		</ReactiveButton>
	);
}

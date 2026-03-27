import React, { useEffect, useRef } from "@rbxts/react";
import { Button } from "@rbxts-ui/components";
import { VStack } from "@rbxts-ui/layout";
import { Text } from "@rbxts-ui/primitives";
import { StylizedBox2 } from "client/components/game/StylizedBox2";
import { SweepStroke } from "client/components/game/SweepStroke";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { TypeWriter } from "client/ui/TypeWriter";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const HINT_WIDTH = 450;
const HINT_BORDER_COLOR = Color3.fromRGB(255, 234, 0);
const HINT_BG_COLOR = palette.black;
const HINT_BORDER_TRANSPARENCY = 0.1;
const HINT_BG_TRANSPARENCY = 0.42;
const HINT_CORNER = 1;

interface TutorialHintProps {
	text: string;
	visible: boolean;
	onDismiss?: () => void;
}

export function TutorialHint({ text, visible, onDismiss }: TutorialHintProps) {
	const rem = useRem();
	const [transparency, transparencyMotion] = useMotion(1);
	const [glow, glowMotion] = useMotion(0);
	const prevVisible = useRef(false);

	useEffect(() => {
		transparencyMotion.spring(visible ? 0 : 1, springs.gentle);

		if (visible && !prevVisible.current) {
			glowMotion.spring(1, springs.bubbly);
			task.delay(0.5, () => glowMotion.spring(0, springs.gentle));
		}
		prevVisible.current = visible;
	}, [visible]);

	if (!visible) return undefined;

	return (
		<Button
			onClick={onDismiss}
			active={true}
			backgroundTransparency={1}
			size={new UDim2(0, rem(HINT_WIDTH, "pixel"), 0, 0)}
			position={new UDim2(0.5, 0, 1, -rem(8))}
			anchorPoint={new Vector2(0.5, 1)}
			automaticSize={Enum.AutomaticSize.Y}
		>
			<StylizedBox2
				borderColor={glow.map((g) => HINT_BORDER_COLOR.Lerp(palette.white, g * 0.3))}
				borderTransparency={glow.map((g) => HINT_BORDER_TRANSPARENCY - g * 0.1)}
				borderThickness={0.3}
				backgroundColor={glow.map((g) => HINT_BG_COLOR.Lerp(HINT_BORDER_COLOR, g * 0.15))}
				backgroundTransparency={glow.map((g) => HINT_BG_TRANSPARENCY - g * 0.2)}
				cornerRadius={HINT_CORNER}
				size={UDim2.fromScale(1, 0)}
				extraStrokes={<SweepStroke color={HINT_BORDER_COLOR} trigger={text} />}
			>
				<VStack size={new UDim2(1, 0, 1, 0)} spacing={rem(0.1)} backgroundTransparency={1} padding={rem(1)}>
					<TypeWriter
						text={text}
						richText={true}
						textSize={rem(1.8)}
						font={fonts.inter.medium}
						textColor={palette.white}
						textTransparency={transparency}
						textXAlignment="Left"
						textWrapped={true}
						textAutoResize="Y"
						size={UDim2.fromScale(1, 0)}
						lineHeight={1.4}
						layoutOrder={1}
						delayBetweenChars={0.03}
						allowSkip={false}
						typingSound={assets.sounds["generated-004_medium"]}
						typingSoundVolume={0.3}
					/>
					<Text
						text="Tap to dismiss"
						textSize={rem(1.25)}
						font={fonts.inter.regular}
						textColor={palette.subtext0}
						textTransparency={transparency}
						textWrapped={false}
						size={new UDim2(1, 0, 0, rem(1.5))}
						textXAlignment="Right"
						layoutOrder={2}
					/>
				</VStack>
			</StylizedBox2>
		</Button>
	);
}

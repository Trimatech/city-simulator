import React, { useEffect } from "@rbxts/react";
import { Button } from "@rbxts-ui/components";
import { Frame, Text } from "@rbxts-ui/primitives";
import { fonts } from "client/constants/fonts";
import { springs } from "client/constants/springs";
import { useMotion } from "client/hooks";
import { useRem } from "client/ui/rem/useRem";
import { TypeWriter } from "client/ui/TypeWriter";
import assets from "shared/assets";
import { palette } from "shared/constants/palette";

const HINT_WIDTH = 450;

interface TutorialHintProps {
	text: string;
	visible: boolean;
	onDismiss?: () => void;
}

export function TutorialHint({ text, visible, onDismiss }: TutorialHintProps) {
	const rem = useRem();
	const [transparency, transparencyMotion] = useMotion(1);

	useEffect(() => {
		transparencyMotion.spring(visible ? 0 : 1, springs.gentle);
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
			<Frame
				name="TutorialHint"
				size={UDim2.fromScale(1, 0)}
				automaticSize={Enum.AutomaticSize.Y}
				backgroundColor={palette.black}
				backgroundTransparency={transparency}
			>
				<uicorner CornerRadius={new UDim(0, rem(15, "pixel"))} />
				<uistroke
					Color={palette.yellow}
					Transparency={transparency}
					Thickness={rem(2, "pixel")}
					BorderStrokePosition={Enum.BorderStrokePosition.Inner}
				/>
				<uipadding
					PaddingLeft={new UDim(0, rem(1.5))}
					PaddingRight={new UDim(0, rem(1.5))}
					PaddingTop={new UDim(0, rem(1.25))}
					PaddingBottom={new UDim(0, rem(1.25))}
				/>
				<uilistlayout SortOrder={Enum.SortOrder.LayoutOrder} Padding={new UDim(0, rem(0.5))} />
				<TypeWriter
					text={text}
					textSize={rem(1.8)}
					font={fonts.inter.medium}
					textColor={palette.white}
					textTransparency={transparency}
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
			</Frame>
		</Button>
	);
}

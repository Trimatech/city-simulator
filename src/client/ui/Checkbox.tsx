import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React, { useMemo } from "@rbxts/react";
import { palette } from "shared/constants/palette";

import { useMotion, useRem } from "../hooks";
import { Frame } from "./layout/frame";
import { Outline } from "./outline";
import { ReactiveButton } from "./reactive-button";
import { Shadow } from "./shadow";
import { Text } from "./text";

interface CheckboxProps {
	checked: boolean;
	onChecked: (checked: boolean) => void;
	text?: string;
	variant?: "default" | "large";
	position?: UDim2;
	disabled?: boolean;
}

export function Checkbox({ checked, onChecked, text, variant = "default", position, disabled = false }: CheckboxProps) {
	const rem = useRem();
	const [hover, hoverMotion] = useMotion(0);
	const checkboxSize = variant === "large" ? 4 : 3;

	const buttonSize = new UDim2(0, rem(checkboxSize), 0, rem(checkboxSize));
	const [textWidth, textWidthMotion] = useMotion({ label: 0, value: 0 });

	const size = useMemo(() => {
		return textWidth.map(({ label, value }) => {
			const content = math.max(label, value);
			const width = checkboxSize;
			return new UDim2(0, rem(width) + content, 0, rem(checkboxSize));
		});
	}, [rem]);

	const cornerRadius = new UDim(1, 0);

	const mainColor = disabled ? palette.overlay0 : palette.blue;
	const textColor = disabled ? palette.overlay0 : palette.black;

	return (
		<ReactiveButton
			backgroundTransparency={1}
			size={size}
			position={position}
			onClick={() => !disabled && onChecked(!checked)}
			onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0)}
		>
			<uilistlayout FillDirection="Horizontal" VerticalAlignment="Center" Padding={new UDim(0, 8)} />

			<Frame backgroundTransparency={1} size={buttonSize}>
				<Shadow shadowBlur={0.3} shadowPosition={rem(0.5)} shadowSize={rem(4)} shadowTransparency={0.7} />
				<Frame backgroundColor={palette.white} cornerRadius={cornerRadius} size={new UDim2(1, 0, 1, 0)}>
					<uigradient
						Offset={lerpBinding(hover, new Vector2(), new Vector2(0, 1))}
						Rotation={90}
						Transparency={new NumberSequence(0, 0.1)}
					/>
				</Frame>

				<Outline
					outerColor={mainColor}
					innerColor={mainColor}
					cornerRadius={cornerRadius}
					innerTransparency={0}
					outerTransparency={1}
				/>

				<Frame
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.5, 0.5)}
					size={new UDim2(0.7, 0, 0.7, 0)}
					backgroundColor={mainColor}
					backgroundTransparency={lerpBinding(checked ? 0 : 1, 0, 1)}
					cornerRadius={new UDim(1, 0)}
				/>
			</Frame>

			{text ? (
				<Text
					text={text}
					size={new UDim2(0, rem(2), 0, rem(2))}
					textColor={textColor}
					textXAlignment="Left"
					change={{
						TextBounds: (rbx) => {
							textWidthMotion.spring({ value: rbx.TextBounds.X });
						},
					}}
				/>
			) : undefined}
		</ReactiveButton>
	);
}

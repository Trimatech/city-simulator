import { lerpBinding } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";

import { useMotion, useRem } from "../../hooks";
import { Frame } from "./frame";
import { Outline } from "./outline";
import { ReactiveButton } from "./reactive-button";
import { Shadow } from "./shadow";
import { Text } from "./text";

interface CheckboxProps {
	checked: boolean;
	onChecked: (checked: boolean) => void;
	text?: string;
	size?: UDim2;
	position?: UDim2;
	disabled?: boolean;
}

export function Checkbox({
	checked,
	onChecked,
	text,
	size = new UDim2(0, 24, 0, 24),
	position,
	disabled = false,
}: CheckboxProps) {
	const rem = useRem();
	const [hover, hoverMotion] = useMotion(0);

	return (
		<ReactiveButton
			backgroundTransparency={1}
			size={new UDim2(0, text ? 200 : size.X.Offset, 0, size.Y.Offset)}
			position={position}
			onClick={() => !disabled && onChecked(!checked)}
			onHover={(hovered) => hoverMotion.spring(hovered ? 1 : 0)}
		>
			<uilistlayout FillDirection="Horizontal" VerticalAlignment="Center" Padding={new UDim(0, 8)} />

			<Frame
				backgroundColor={disabled ? new Color3(0.8, 0.8, 0.8) : new Color3(1, 1, 1)}
				borderColor={new Color3(0.8, 0.8, 0.8)}
				size={size}
			>
				<Shadow
					shadowSize={rem(2.5)}
					shadowBlur={0.2}
					shadowTransparency={lerpBinding(hover, 0.7, 0.4)}
					shadowPosition={rem(0.5)}
				/>

				<Outline cornerRadius={new UDim(0, 4)} innerTransparency={0} />

				<Frame
					anchorPoint={new Vector2(0.5, 0.5)}
					position={UDim2.fromScale(0.5, 0.5)}
					size={new UDim2(0, size.X.Offset * 0.6, 0, size.Y.Offset * 0.15)}
					backgroundColor={new Color3(0.2, 0.2, 0.2)}
					rotation={lerpBinding(checked ? 45 : 0, 0, 1)}
					backgroundTransparency={lerpBinding(checked ? 0 : 1, 0, 1)}
				>
					<Frame
						anchorPoint={new Vector2(0.5, 0.5)}
						position={UDim2.fromScale(0.5, 0.5)}
						size={new UDim2(0, size.X.Offset * 0.15, 0, size.Y.Offset * 0.6)}
						backgroundColor={new Color3(0.2, 0.2, 0.2)}
						rotation={90}
						backgroundTransparency={lerpBinding(checked ? 0 : 1, 0, 1)}
					/>
				</Frame>
			</Frame>

			{text ? (
				<Text
					text={text}
					size={new UDim2(0, 14, 0, 14)}
					textColor={disabled ? new Color3(0.6, 0.6, 0.6) : new Color3(0.2, 0.2, 0.2)}
				/>
			) : undefined}
		</ReactiveButton>
	);
}

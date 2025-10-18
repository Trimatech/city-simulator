import { composeBindings, useTimer } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { palette } from "shared/constants/palette";

import { useMotion, useRem } from "../hooks";
import { Frame } from "./layout/frame";
import { Outline } from "./outline";
import { ReactiveButton } from "./reactive-button";

interface PrimaryButtonProps extends React.PropsWithChildren {
	readonly onClick?: () => void;
	readonly onHover?: (hovered: boolean) => void;
	readonly enabled?: boolean;
	readonly size?: UDim2 | React.Binding<UDim2>;
	readonly position?: UDim2 | React.Binding<UDim2>;
	readonly anchorPoint?: Vector2 | React.Binding<Vector2>;
	readonly overlayGradient?: ColorSequence | React.Binding<ColorSequence>;
	readonly overlayTransparency?: number | React.Binding<number>;
	readonly overlayRotation?: number | React.Binding<number>;
	readonly layoutOrder?: number | React.Binding<number>;
}

export function PrimaryButton({
	onClick,
	onHover,
	enabled = true,
	size,
	position,
	anchorPoint,
	overlayGradient,

	overlayRotation,
	layoutOrder,
	children,
}: PrimaryButtonProps) {
	const rem = useRem();
	const [hover, hoverMotion] = useMotion(0);
	const timer = useTimer();

	const cornerRadius = new UDim(0, rem(1));

	const gradientColor = new ColorSequence(palette.sky, palette.sky);
	const gradientSpin = timer.value.map((t) => 30 * t);
	const gradientRotation = composeBindings(hover, gradientSpin, (h, r) => (h > 0 ? r : 90));

	return (
		<ReactiveButton
			onClick={onClick}
			onHover={(hovered) => {
				hoverMotion.spring(hovered ? 1 : 0);
				onHover?.(hovered);
			}}
			backgroundTransparency={1}
			enabled={enabled}
			anchorPoint={anchorPoint}
			size={size}
			position={position}
			layoutOrder={layoutOrder}
		>
			<Frame
				backgroundColor={palette.white}
				cornerRadius={new UDim(0, rem(1))}
				size={new UDim2(1, 0, 1, 0)}
				backgroundTransparency={0}
			>
				<uigradient Color={gradientColor} Rotation={gradientRotation} />
			</Frame>

			<Outline
				cornerRadius={cornerRadius}
				innerTransparency={0}
				innerThickness={0}
				outerColor={palette.white}
				innerColor={palette.white}
				outerThickness={rem(0.2)}
			/>

			{children}
		</ReactiveButton>
	);
}

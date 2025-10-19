import React, { useRef, useState } from "@rbxts/react";
import { palette } from "shared/constants/palette";
import { brighten } from "shared/utils/color-utils";

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	overlayGradient: _overlayGradient,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	overlayRotation: _overlayRotation,
	layoutOrder,
	children,
}: PrimaryButtonProps) {
	const rem = useRem();
	const [_hover, hoverMotion] = useMotion(0);
	const uiRef = useRef<Frame>();
	const [offset, setOffset] = useState(new Vector2(0.5, 0.5));
	const [rotation, setRotation] = useState(90);

	const cornerRadius = new UDim(0, rem(1));

	const brighterBlue = brighten(palette.blue, 0.5);

	const gradientColor = new ColorSequence([
		new ColorSequenceKeypoint(0, palette.blue),
		new ColorSequenceKeypoint(0.5, brighterBlue),
		new ColorSequenceKeypoint(1, palette.blue),
	]);

	const color = gradientColor;

	return (
		<ReactiveButton
			onClick={onClick}
			onHover={(hovered) => {
				hoverMotion.spring(hovered ? 1 : 0);
				onHover?.(hovered);
			}}
			event={undefined}
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
				ref={uiRef}
				change={{
					AbsoluteSize: (_rbx) => {
						setOffset(new Vector2(0.5, 0.5));
					},
					AbsolutePosition: (_rbx) => {
						setOffset(new Vector2(0.5, 0.5));
					},
				}}
				event={{
					MouseMoved: (rbx, x: number, y: number) => {
						const frame = uiRef.current;
						if (frame === undefined) return;
						const absPos = frame.AbsolutePosition;
						const absSize = frame.AbsoluteSize;
						const relX01 = math.clamp((x - absPos.X) / math.max(1, absSize.X), 0, 1);
						const relY01 = math.clamp((y - absPos.Y) / math.max(1, absSize.Y), 0, 1);
						// Keep gradient center at mouse in UIGradient [-1, 1] space
						setOffset(new Vector2(relX01 * 2 - 1, relY01 * 2 - 1));
						// Rotate the gradient so it faces toward the center from the mouse
						const vx = 0.5 - relX01;
						const vy = 0.5 - relY01;
						if (math.abs(vx) > 1e-4 || math.abs(vy) > 1e-4) {
							const angle = math.deg(math.atan2(vy, vx));
							setRotation(angle + 180);
						}
					},
				}}
			>
				<uigradient Color={color} Offset={offset} Rotation={rotation} />
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

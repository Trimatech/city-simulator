import React, { useRef, useState } from "@rbxts/react";
import { mapMouseToUiGradient } from "client/utils/ui-gradient.utils";
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
	const [rotation, setRotation] = useState(45);

	const cornerRadius = new UDim(0, rem(1));

	const primaryColor = palette.sky;

	const brighterBlue = palette.sapphire;

	const gradientColor = new ColorSequence([
		new ColorSequenceKeypoint(0, primaryColor),
		new ColorSequenceKeypoint(0.5, brighterBlue),
		new ColorSequenceKeypoint(1, primaryColor),
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
					AbsoluteSize: () => setOffset(new Vector2(0.5, 0.5)),
					AbsolutePosition: () => setOffset(new Vector2(0.5, 0.5)),
				}}
				event={{
					MouseMoved: (rbx, x: number, y: number) => {
						const frame = uiRef.current;
						if (frame === undefined) return;

						const result = mapMouseToUiGradient({ frame, mouseX: x, mouseY: y });
						setOffset(result.offset);
						if (result.rotation !== undefined) setRotation(result.rotation);
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
